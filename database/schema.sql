-- CGPA Tracker — PostgreSQL schema (reference / manual apply)
-- Tables are also created by SQLAlchemy on API startup.

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    course_duration INTEGER NOT NULL,
    cgpa_scale DOUBLE PRECISION NOT NULL DEFAULT 4,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS semesters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    position INTEGER NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'upcoming',
    label VARCHAR(64),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_year_semester UNIQUE (user_id, year, semester)
);

CREATE INDEX IF NOT EXISTS ix_semesters_user_id ON semesters (user_id);

CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    semester_id INTEGER NOT NULL REFERENCES semesters (id) ON DELETE CASCADE,
    course_code VARCHAR(32) NOT NULL,
    course_title VARCHAR(255) NOT NULL,
    credit_unit NUMERIC(5, 2) NOT NULL,
    grade VARCHAR(4) NOT NULL,
    grade_point NUMERIC(4, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_courses_semester_id ON courses (semester_id);

CREATE TABLE IF NOT EXISTS semester_results (
    id SERIAL PRIMARY KEY,
    semester_id INTEGER NOT NULL UNIQUE REFERENCES semesters (id) ON DELETE CASCADE,
    gpa NUMERIC(5, 3) NOT NULL,
    cgpa NUMERIC(5, 3) NOT NULL
);
