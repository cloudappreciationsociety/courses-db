-- Which courses have CS-UY 1134 as a prerequisite?
SELECT DISTINCT p.course_id, c.title
FROM prerequisite p
JOIN course c ON c.course_id = p.course_id
WHERE p.target_course_id = 'CS-UY 1134'
ORDER BY p.course_id;


-- Search CS undergrad courses by keyword "introduction"
SELECT c.course_id, c.title, c.credits, c.career_level,
    d.name AS department, sc.name AS school
FROM course c
JOIN department d ON d.department_id = c.department_id
JOIN school sc ON sc.school_id = d.school_id
WHERE (c.title ILIKE '%introduction%'
    OR c.course_id ILIKE '%introduction%'
    OR c.description ILIKE '%introduction%')
    AND c.department_id = 'CS'
    AND c.career_level  = 'undergrad'
ORDER BY c.course_id;


-- Find sections and instructors who teach them with course_id and session_id
SELECT s.section_id, s.section_code, s.component, s.instruction_mode, s.status,
    s.time_slot_id AS days,
    to_char(s.start_time, 'HH24:MI') || '-' || to_char(s.end_time, 'HH24:MI') AS time,
    b.name AS building, s.room_number, ca.name AS campus,
    (i.first_name || ' '  || i.last_name) AS instructor_name,
    GREATEST(s.capacity - s.enrolled_count, 0) AS seats_left,
    s.waitlist_count, s.notes
FROM section s
LEFT JOIN building b ON b.building_id = s.building_id
LEFT JOIN campus ca ON ca.campus_id = b.campus_id
LEFT JOIN teaches t ON t.section_id = s.section_id
LEFT JOIN instructor i ON i.instructor_id = t.instructor_id
WHERE s.course_id = 'CS-UY 2124'
    AND s.session_id = 'F26'
GROUP BY s.section_id, b.name, ca.name, i.first_name, i.last_name
ORDER BY s.component, s.section_code;


-- Recursive helper function
CREATE OR REPLACE FUNCTION is_prereq_satisfied(p_node INTEGER, p_student TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE AS $$
DECLARE
    p_row prerequisite%ROWTYPE;
BEGIN
    SELECT * INTO p_row FROM prerequisite WHERE prereq_id = p_node;
 
    -- Has the student completed the course with a non-failing grade / met the grade requirement?
    IF p_row.prereq_type = 'course' THEN
        RETURN EXISTS (
            SELECT 1
            FROM takes t
            JOIN section s ON s.section_id = t.section_id
            JOIN grade_scale g ON g.grade = t.grade
            WHERE t.student_id = p_student
                AND t.status = 'completed'
                AND t.grade <> 'F'
                AND s.course_id = p_row.target_course_id
                AND (
                    p_row.min_grade IS NULL
                    OR g.grade_points >=
                        (SELECT grade_points FROM grade_scale WHERE grade = p_row.min_grade)
                )
        );
    ELSEIF p_row.prereq_type = 'and' THEN -- All must satisfy
        RETURN NOT EXISTS (
            SELECT 1 FROM prerequisite c
            WHERE c.parent_prereq_id = p_node
                AND NOT is_prereq_satisfied(c.prereq_id, p_student)
        );
    ELSEIF p_row.prereq_type = 'or' THEN -- One must satisfy
        RETURN EXISTS (
            SELECT 1 FROM prerequisite c
            WHERE c.parent_prereq_id = p_node
                AND is_prereq_satisfied(c.prereq_id, p_student)
        );
    ELSE  -- 'not' - None must satisfy
        RETURN NOT EXISTS (
            SELECT 1 FROM prerequisite c
            WHERE c.parent_prereq_id = p_node
                AND is_prereq_satisfied(c.prereq_id, p_student)
        );
    END IF;
END;
$$;
 
-- Does the student meet a course's prerequisites? Returns true if the course has no preqrequisites.
CREATE OR REPLACE FUNCTION meets_prereqs(p_course TEXT, p_student TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
    SELECT COALESCE(
        (
            SELECT is_prereq_satisfied(prereq_id, p_student)
            FROM prerequisite
            WHERE course_id = p_course AND parent_prereq_id IS NULL
        ),
        TRUE
    );
$$;

SELECT 
    meets_prereqs('CS-UY 1134', 'N00000001') AS "1134", -- Yes, 1134 has no prerequisites
    meets_prereqs('CS-UY 2124', 'N00000001') AS "2124", -- Yes, took 1134
    meets_prereqs('CS-UY 3083', 'N00000001') AS "3083"; -- No, needs to have completed 2124

