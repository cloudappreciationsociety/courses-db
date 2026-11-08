CREATE TABLE grade_scale (
    grade TEXT PRIMARY KEY,
    grade_points NUMERIC(4, 3)
);

CREATE TABLE school (
    school_id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE department (
    department_id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    school_id TEXT NOT NULL REFERENCES school (school_id)
);

CREATE TABLE session (
    session_id TEXT PRIMARY KEY,
    semester TEXT NOT NULL CHECK (
        semester IN ('fall', 'spring', 'summer')
    ),
    year INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);

CREATE TABLE campus (
    campus_id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE building (
    building_id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    campus_id TEXT NOT NULL REFERENCES campus (campus_id)
);

CREATE TABLE classroom (
    building_id TEXT NOT NULL REFERENCES building (building_id),
    room_number TEXT NOT NULL,
    PRIMARY KEY (building_id, room_number)
);

CREATE TABLE course (
    course_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    credits NUMERIC(3, 1) NOT NULL CHECK (credits > 0),
    description TEXT,
    requires_dept_consent BOOLEAN NOT NULL DEFAULT FALSE,
    career_level TEXT NOT NULL CHECK (
        career_level IN ('undergrad', 'grad')
    ),
    department_id TEXT NOT NULL REFERENCES department (department_id) ON UPDATE CASCADE
);

CREATE TABLE prerequisite (
    prereq_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES course (course_id) ON UPDATE CASCADE ON DELETE CASCADE,
    prereq_type TEXT NOT NULL CHECK (
        prereq_type IN ('and', 'or', 'not', 'course')
    ),
    parent_prereq_id INTEGER,
    target_course_id TEXT REFERENCES course (course_id),
    min_grade TEXT REFERENCES grade_scale (grade),
    UNIQUE (prereq_id, course_id),
    -- Parent must exist in this table
    FOREIGN KEY (parent_prereq_id, course_id) REFERENCES prerequisite (prereq_id, course_id) ON UPDATE CASCADE ON DELETE CASCADE,
    -- Parent cannot be equal to itself
    CHECK (
        parent_prereq_id IS NULL
        OR parent_prereq_id <> prereq_id
    ),
    -- Leaves must have a target course; others do not
    CHECK (
        (
            prereq_type = 'course'
            AND target_course_id IS NOT NULL
            AND target_course_id <> course_id
        )
        OR (
            prereq_type <> 'course'
            AND target_course_id IS NULL
            AND min_grade IS NULL
        )
    )
);

CREATE TABLE time_slot (
    time_slot_id TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    PRIMARY KEY (
        time_slot_id,
        start_time,
        end_time
    ),
    CHECK (end_time > start_time)
);

CREATE TABLE section (
    section_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES course (course_id) ON UPDATE CASCADE,
    section_code TEXT NOT NULL,
    session_id TEXT NOT NULL REFERENCES session (session_id) ON UPDATE CASCADE,
    component TEXT NOT NULL DEFAULT 'lecture' CHECK (
        component IN (
            'lecture',
            'recitation',
            'laboratory'
        )
    ),
    instruction_mode TEXT NOT NULL DEFAULT 'in_person' CHECK (
        instruction_mode IN (
            'in_person',
            'online',
            'hybrid'
        )
    ),
    notes TEXT,
    enrolled_count INTEGER NOT NULL DEFAULT 0 CHECK (enrolled_count >= 0),
    waitlist_count INTEGER NOT NULL DEFAULT 0 CHECK (waitlist_count >= 0),
    status TEXT NOT NULL DEFAULT 'open' CHECK (
        status IN ('open', 'waitlist', 'closed', 'canceled')
    ),
    capacity INTEGER NOT NULL DEFAULT 30 CHECK (capacity >= 0),
    building_id TEXT,
    room_number TEXT,
    time_slot_id TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    UNIQUE (
        course_id,
        section_code,
        session_id
    ),
    FOREIGN KEY (building_id, room_number) REFERENCES classroom (building_id, room_number),
    FOREIGN KEY (
        time_slot_id,
        start_time,
        end_time
    ) REFERENCES time_slot (
        time_slot_id,
        start_time,
        end_time
    ),
    -- Either we have a room or we don't, and a room is required unless the section is online
    CHECK (
        (building_id IS NULL) = (room_number IS NULL)
    ),
    CHECK (
        instruction_mode = 'online'
        OR building_id IS NOT NULL
    ),
    CHECK (enrolled_count <= capacity)
);

CREATE TABLE instructor (
    instructor_id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    department_id TEXT NOT NULL REFERENCES department (department_id) ON UPDATE CASCADE
);

CREATE TABLE teaches (
    instructor_id TEXT NOT NULL REFERENCES instructor (instructor_id),
    section_id INTEGER NOT NULL REFERENCES section (section_id),
    PRIMARY KEY (instructor_id, section_id)
);

CREATE TABLE student (
    student_id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    career_level TEXT NOT NULL CHECK (
        career_level IN ('undergrad', 'grad')
    ),
    total_credits NUMERIC(5, 1) NOT NULL DEFAULT 0 CHECK (total_credits >= 0),
    department_id TEXT NOT NULL REFERENCES department (department_id) ON UPDATE CASCADE
);

CREATE TABLE admin (
    admin_id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL
);

CREATE TABLE takes (
    student_id TEXT NOT NULL REFERENCES student (student_id),
    section_id INTEGER NOT NULL REFERENCES section (section_id),
    status TEXT NOT NULL CHECK (
        status IN (
            'enrolled',
            'waitlisted',
            'dropped',
            'completed'
        )
    ),
    waitlist_position INTEGER CHECK (waitlist_position > 0),
    grade TEXT REFERENCES grade_scale (grade),
    PRIMARY KEY (student_id, section_id),
    -- A waitlist position exists exactly when the student is waitlisted
    CHECK (
        (status = 'waitlisted') = (waitlist_position IS NOT NULL)
    ),
    -- Grades only exist once the course is completed
    CHECK (
        grade IS NULL
        OR status = 'completed'
    )
);

CREATE TABLE in_cart (
    student_id TEXT NOT NULL REFERENCES student (student_id) ON DELETE CASCADE,
    section_id INTEGER NOT NULL REFERENCES section (section_id) ON DELETE CASCADE,
    PRIMARY KEY (student_id, section_id)
);

CREATE TABLE registration_request (
    request_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES student (student_id),
    add_section_id INTEGER REFERENCES section (section_id),
    drop_section_id INTEGER REFERENCES section (section_id),
    request_type TEXT NOT NULL CHECK (
        request_type IN ('enroll', 'swap', 'drop')
    ),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'approved',
            'denied',
            'waitlisted'
        )
    ),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by TEXT REFERENCES admin (admin_id),
    admin_note TEXT,
    CHECK (
        (
            request_type = 'swap'
            AND add_section_id IS NOT NULL
            AND drop_section_id IS NOT NULL
            AND add_section_id <> drop_section_id
        )
        OR (
            request_type = 'enroll'
            AND add_section_id IS NOT NULL
            AND drop_section_id IS NULL
        )
        OR (
            request_type = 'drop'
            AND add_section_id IS NULL
            AND drop_section_id IS NOT NULL
        )
    )
);

