CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO
    app_user (university_id, net_id, first_name, last_name, password, role)
VALUES
    ('N64820584', 'sk1', 'Sarah', 'Kendall', crypt('123456', gen_salt('bf')), 'instructor'),
    ('N29842114', 'sc1', 'Sam', 'Campbell', crypt('123456', gen_salt('bf')), 'instructor'),
    ('N19342150', 'cw1', 'Claudia', 'Winkleman', crypt('123456', gen_salt('bf')), 'instructor'),
    ('N19332159', 'bc1', 'Bridget', 'Christie', crypt('123456', gen_salt('bf')), 'instructor'),
    ('N69332159', 'az1', 'Andy', 'Zaltzman', crypt('123456', gen_salt('bf')), 'instructor'),
    ('N00000001', 'jw1', 'Josh', 'Widdicombe', crypt('123456', gen_salt('bf')), 'student'),
    ('N00000002', 'ja1', 'James', 'Acaster', crypt('123456', gen_salt('bf')), 'student'),
    ('N00000003', 'rc1', 'Roisin', 'Conaty', crypt('123456', gen_salt('bf')), 'student'),
    ('N00000004', 'rr1', 'Romesh', 'Ranganathan', crypt('123456', gen_salt('bf')), 'student'),
    ('N00000005', 'tk1', 'Tim', 'Key', crypt('123456', gen_salt('bf')), 'student'),
    ('N10000000', 'gd1', 'Greg', 'Davies', crypt('123456', gen_salt('bf')), 'admin'),
    ('N10000001', 'ah1', 'Alex', 'Horne', crypt('123456', gen_salt('bf')), 'admin');


INSERT INTO
    grade_scale (grade, grade_points)
VALUES 
    ('A', 4.000),
    ('A-', 3.667),
    ('B+', 3.333),
    ('B', 3.000),
    ('B-', 2.667),
    ('C+', 2.333),
    ('C', 2.000),
    ('C-', 1.667),
    ('D+', 1.333),
    ('D', 1.000),
    ('F', 0.000),
    ('P', NULL), -- Pass
    ('W', NULL), -- Withdrew
    ('***', NULL); -- In progress


INSERT INTO
    school (school_id, name)
VALUES 
    ('TANDON', 'Tandon School of Engineering'),
    ('COURANT', 'Courant Institute School of Mathematics, Computing, and Data Science');

INSERT INTO
    department (department_id, name, school_id)
VALUES 
    ('CS', 'Computer Science', 'TANDON'),
    ('MA', 'Mathematics', 'TANDON');

INSERT INTO
    session (session_id, semester, year, start_date, end_date)
VALUES
    ('F25', 'fall', 2025, '2025-09-01', '2026-12-13'),
    ('S26', 'spring', 2025, '2025-01-20', '2026-5-13'),
    ('F26', 'fall', 2026, '2026-09-01', '2026-12-13');

INSERT INTO
    campus (campus_id, name)
VALUES 
    ('BK', 'Brooklyn Campus'),
    ('WSQ', 'Washington Square');

INSERT INTO
    building (building_id, name, campus_id)
VALUES 
    ('JAB', 'Jacobs Hall, 6 MetroTech', 'BK'),
    ('2MTC', '2 MetroTech Center', 'BK'),
    ('5MTC', '5 MetroTech Center', 'BK');

INSERT INTO
    classroom (building_id, room_number)
VALUES 
    ('JAB', '201'),
    ('JAB', '205'),
    ('JAB', '215'),
    ('JAB', '404'),
    ('JAB', '774'),
    ('JAB', '773'),
    ('2MTC', '909'),
    ('2MTC', '817'),
    ('5MTC', 'AUD');

INSERT INTO
    course (
        course_id, title, credits,
        description,
        requires_dept_consent, career_level, department_id
    )
VALUES 
    (
        'CS-UY 3083', 'Introduction to Databases', 3.0,
        'This course introduces database systems and their approach as a mechanism to model the real world. The course covers data models (relational, object-oriented), physical database design, query languages, query processing and optimization, as well as transaction management techniques. Implementation issues, object oriented and distributed databases also are introduced.',
        false, 'undergrad', 'CS'
    ),
    (
        'CS-UY 1134', 'Data Structures and Algorithms', 4.0,
        'This course covers abstract data types and the implementation and use of standard data structures along with fundamental algorithms and the basics of algorithm analysis.',
        false, 'undergrad', 'CS'
    ),
    (
        'CS-UY 2124', 'Object Oriented Programming', 4.0,
        'This intermediate-level programming course teaches object-oriented programming in C++. Topics: Pointers, dynamic memory allocation and recursion. Classes and objects including constructors, destructors, methods (member functions) and data members. Access and the interface to relationships of classes including composition, association and inheritance. Polymorphism through function overloading operators. Inheritance and templates. Use of the standard template library containers and algorithms.',
        false, 'undergrad', 'CS'
    ),
    (
        'MA-UY 2314', 'Discrete Mathematics', 4.0,
        'Logic, proofs, set theory, functions, relations, asymptotic notation, recurrences, modeling computation, graph theory.',
        false, 'undergrad', 'MA'
    );

INSERT INTO
    time_slot (time_slot_id, start_time, end_time)
VALUES 
    ('M,W', '08:00', '10:50'),
    ('M,W', '09:30', '10:50'),
    ('M,W', '11:00', '12:20'),
    ('M,W', '15:30', '16:50'),
    ('F', '08:00', '10:50'),
    ('F', '14:00', '16:50');

-- Prerequisites

-- Helper function that recursively inserts course prerequisites from JSON
CREATE FUNCTION pg_temp.add_prereq(p_course TEXT, p_rule JSONB, p_parent INTEGER DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
    v_id    INTEGER; -- Store generated ID of the created preqrequisite, to use as p_parent for recursive calls
    v_child JSONB; -- Store children prerequisite JSON in loop
BEGIN
    INSERT INTO prerequisite (course_id, prereq_type, parent_prereq_id, target_course_id, min_grade)
    VALUES (p_course, p_rule->>'type', p_parent, p_rule->>'course', p_rule->>'min_grade')
    RETURNING prereq_id INTO v_id;

    FOR v_child IN
        SELECT jsonb_array_elements(
            COALESCE(p_rule->'children', '[]'::jsonb) -- Empty array instead of null for leaf nodes
        )
    LOOP
        PERFORM pg_temp.add_prereq(p_course, v_child, v_id);
    END LOOP;
END;
$$;

-- CS-UY 2124: CS-UY 1134
SELECT pg_temp.add_prereq 
    (
        'CS-UY 2124', '{"type": "course", "course": "CS-UY 1134", "min_grade": "C"}'
    );

-- CS-UY 3083: CS-UY 1134 AND CS-UY 2124
SELECT pg_temp.add_prereq 
    (
        'CS-UY 3083', 
        '{
            "type": "and", 
            "children": [
                {"type": "course", "course": "CS-UY 1134", "min_grade": "C-"},
                {"type": "course", "course": "CS-UY 2124", "min_grade": "C-"}
            ]
        }'
    );

INSERT INTO
    section (
        course_id, section_code, session_id,
        component, instruction_mode,
        notes,
        capacity,
        building_id, room_number,
        time_slot_id, start_time, end_time
    )
VALUES 
    (
        'CS-UY 1134', 'ALEC', 'F25',
        'lecture', 'in_person',
        'Enrollment is limited to SOE Undergrad students in Comp Sci, Comp Eng, Electrical Eng, Elect & Comp Eng, Math, Math/Physics Undeclared, Abu Dhabi, Shanghai, and minors in Comp Sci, Cyber Security, or Game Eng. All others, copy and paste this link:https://bit.ly/CSECrossRegistrationFall26UY',
        40,
        'JAB', '215',
        'M,W', '11:00', '12:20'
    ),
    (
        'CS-UY 1134', 'ALEC', 'S26',
        'lecture', 'in_person',
        'Enrollment is limited to SOE Undergrad students in Comp Sci, Comp Eng, Electrical Eng, Elect & Comp Eng, Math, Math/Physics Undeclared, Abu Dhabi, Shanghai, and minors in Comp Sci, Cyber Security, or Game Eng. All others, copy and paste this link:https://bit.ly/CSECrossRegistrationFall26UY',
        40,
        'JAB', '404',
        'M,W', '11:00', '12:20'
    ),
    (
        'CS-UY 2124', 'ALEC', 'S26',
        'lecture', 'in_person',
        'Enrollment is limited to SOE Undergrad students in Comp Sci, Comp Eng, Elect & Comp Eng, Math, Math/CS, Math/Physics Undeclared and minors in Comp Sci, Cyber Security or Game Eng. All others, copy and paste this link:https://bit.ly/CSECrossRegistrationFall26UY',
        50,
        '2MTC', '817',
        'M,W', '09:30', '10:50'
    ),
    (
        'CS-UY 3083', 'A', 'F26',
        'lecture', 'in_person',
        'Enrollment is limited to School of Engineering Undergraduate students in Computer Science, Computer Engineering, Electrical & Computer Engineering, Math, Math/Physics, Math/CS, Abu Dhabi, Shanghai and Data Science and minor in Computer Science. All others, copy and paste this link: https://bit.ly/CSECrossRegistrationFall26UY',
        30,
        '2MTC', '909',
        'M,W', '15:30', '16:50'
    ),
    (
        'CS-UY 1134', 'ALEC', 'F26',
        'lecture', 'in_person',
        'Enrollment is limited to SOE Undergrad students in Comp Sci, Comp Eng, Electrical Eng, Elect & Comp Eng, Math, Math/Physics Undeclared, Abu Dhabi, Shanghai, and minors in Comp Sci, Cyber Security, or Game Eng. All others, copy and paste this link:https://bit.ly/CSECrossRegistrationFall26UY',
        40,
        'JAB', '215',
        'M,W', '11:00', '12:20'
    ),
    (
        'CS-UY 1134', 'LAB1', 'F26',
        'laboratory', 'in_person',
        NULL,
        40,
        'JAB', '201',
        'F', '08:00', '10:50'
    ),
    (
        'CS-UY 2124', 'ALEC', 'F26',
        'lecture', 'in_person',
        'Enrollment is limited to SOE Undergrad students in Comp Sci, Comp Eng, Elect & Comp Eng, Math, Math/CS, Math/Physics Undeclared and minors in Comp Sci, Cyber Security or Game Eng. All others, copy and paste this link:https://bit.ly/CSECrossRegistrationFall26UY',
        50,
        '2MTC', '817',
        'M,W', '09:30', '10:50'
    ),
    (
        'CS-UY 2124', 'LAB1', 'F26',
        'laboratory', 'in_person',
        NULL,
        30,
        'JAB', '774',
        'F', '08:00', '10:50'
    ),
    (
        'CS-UY 2124', 'LAB7', 'F26',
        'laboratory', 'in_person',
        NULL,
        30,
        'JAB', '773',
        'F', '14:00', '16:50'
    );

CREATE FUNCTION pg_temp.section(p_course TEXT, p_code TEXT, p_session TEXT)
RETURNS INTEGER LANGUAGE sql STABLE AS $$
    SELECT section_id FROM section
    WHERE course_id = p_course AND section_code = p_code
      AND session_id = p_session;
$$;

-- People
INSERT INTO
    instructor (university_id, department_id)
VALUES 
    ('N64820584', 'CS'),
    ('N29842114', 'CS'),
    ('N19342150', 'CS'),
    ('N19332159', 'MA'),
    ('N69332159', 'MA');

INSERT INTO
    student (university_id, career_level, total_credits, department_id)
VALUES 
    ('N00000001', 'undergrad', 62.0, 'CS'),
    ('N00000002', 'undergrad', 58.0, 'CS'),
    ('N00000003', 'undergrad', 12.0, 'CS'),
    ('N00000004', 'grad', 12.0, 'CS'),
    ('N00000005', 'undergrad', 6.0, 'MA');

INSERT INTO
    admin (university_id)
VALUES 
    ('N10000000'),
    ('N10000001');

INSERT INTO
    teaches (instructor_id, section_id)
VALUES 
    ('N29842114', pg_temp.section ('CS-UY 1134', 'ALEC', 'S26')),
    ('N64820584', pg_temp.section ('CS-UY 3083', 'A', 'F26')),
    ('N29842114', pg_temp.section ('CS-UY 1134', 'ALEC', 'F26')),
    ('N29842114', pg_temp.section ('CS-UY 1134', 'LAB1', 'F26')),
    ('N19342150', pg_temp.section ('CS-UY 2124', 'ALEC', 'F26')),
    ('N19342150', pg_temp.section ('CS-UY 2124', 'LAB1', 'F26')),
    ('N19342150', pg_temp.section ('CS-UY 2124', 'LAB7', 'F26'));
    
INSERT INTO 
    takes (student_id, section_id, status, waitlist_position, grade)
VALUES
    ('N00000001', pg_temp.section ('CS-UY 1134', 'ALEC', 'F25'), 'completed', NULL, 'A-'),
    ('N00000002', pg_temp.section ('CS-UY 1134', 'ALEC', 'F25'), 'completed', NULL, 'B'),
    ('N00000004', pg_temp.section ('CS-UY 1134', 'ALEC', 'F25'), 'completed', NULL, 'D'),
    ('N00000001', pg_temp.section ('CS-UY 2124', 'ALEC', 'S26'), 'enrolled', NULL, NULL),
    ('N00000002', pg_temp.section ('CS-UY 2124', 'ALEC', 'S26'), 'enrolled', NULL, NULL),
    ('N00000004', pg_temp.section ('CS-UY 1134', 'ALEC', 'S26'), 'enrolled', NULL, NULL);

INSERT INTO 
    in_cart (student_id, section_id) 
VALUES
    ('N00000001', pg_temp.section ('CS-UY 3083', 'A', 'F26'));

INSERT INTO 
    registration_request (
        student_id, request_type, 
        add_section_id, drop_section_id,
        status, 
        reviewed_at, reviewed_by, 
        admin_note
    )
VALUES
    (
        'N00000001', 'enroll',
        pg_temp.section ('CS-UY 3083', 'A', 'F26'), NULL,
        'approved',
        NULL, NULL, 
        NULL
    ),
    (
        'N00000002', 'drop', 
        NULL, pg_temp.section ('CS-UY 3083', 'A', 'F26'),
        'approved',
        NULL, NULL, 
        NULL
    ),
    (
        'N00000003', 'enroll', 
        pg_temp.section ('CS-UY 3083', 'A', 'F26'), NULL,
        'pending', 
        NULL, NULL,
        NULL
    ),
    (
        'N00000004', 'swap',
        pg_temp.section ('CS-UY 2124', 'LAB1', 'F26'), pg_temp.section ('CS-UY 2124', 'LAB7', 'F26'),
        'approved',
        NULL, NULL,
        NULL
    );


UPDATE section s SET
    enrolled_count = (
        SELECT count(*)
        FROM takes t
        WHERE t.section_id = s.section_id AND t.status = 'enrolled'
    ),
    waitlist_count = (
        SELECT count(*) FROM takes t
        WHERE t.section_id = s.section_id AND t.status = 'waitlisted'
    );
 
UPDATE section s SET status =
    CASE
        WHEN s.waitlist_count > 0 THEN 'waitlist'
        WHEN s.enrolled_count >= s.capacity THEN 'closed'
        ELSE 'open'
    END
WHERE s.building_id IS NOT NULL;