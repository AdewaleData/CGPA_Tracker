-- Run once if your `users` table was created before `cgpa_scale` existed:
-- psql -U postgres -d cgpa_tracker -f database/migrations/001_add_users_cgpa_scale.sql

ALTER TABLE users
ADD COLUMN IF NOT EXISTS cgpa_scale DOUBLE PRECISION NOT NULL DEFAULT 4;
