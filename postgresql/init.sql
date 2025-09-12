CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- スケジュール本体
CREATE TABLE IF NOT EXISTS schedules (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- スケジュールのタイムスロット
CREATE TABLE IF NOT EXISTS schedule_timeslots (
    id SERIAL PRIMARY KEY,
    schedule_uuid UUID NOT NULL REFERENCES schedules(uuid) ON DELETE CASCADE,
    start_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- スケジュールに対する参加者の可用性
CREATE TABLE IF NOT EXISTS availabilities (
    id SERIAL PRIMARY KEY,
    schedule_uuid UUID NOT NULL REFERENCES schedules(uuid) ON DELETE CASCADE,
    guest_user_name VARCHAR NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 可用性のタイムスロット
CREATE TABLE IF NOT EXISTS availability_timeslots (
    id SERIAL PRIMARY KEY,
    availability_id INTEGER NOT NULL REFERENCES availabilities(id) ON DELETE CASCADE,
    status SMALLINT NOT NULL CHECK (status IN (1, 2, 3)), -- 1=いける, 2=不明, 3=いけない
    start_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

INSERT INTO schedules (uuid, title)
VALUES ('11111111-2222-3333-4444-555555555555', 'テスト用スケジュール');

INSERT INTO schedule_timeslots (schedule_uuid, start_time, end_time)
VALUES
  ('11111111-2222-3333-4444-555555555555', '2025-09-10 09:00:00', '2025-09-10 12:00:00'),
  ('11111111-2222-3333-4444-555555555555', '2025-09-10 13:00:00', '2025-09-10 15:00:00'),
  ('11111111-2222-3333-4444-555555555555', '2025-09-11 10:00:00', '2025-09-11 11:00:00');

INSERT INTO availabilities (schedule_uuid, guest_user_name) VALUES
  ('11111111-2222-3333-4444-555555555555', 'A子'),
  ('11111111-2222-3333-4444-555555555555', 'B子'),
  ('11111111-2222-3333-4444-555555555555', 'C子');

INSERT INTO availability_timeslots (availability_id, status, start_time, end_time) VALUES
  (1, 1, '2025-07-12 00:30:00', '2025-07-12 02:45:00'),
  (1, 1, '2025-07-12 08:30:00', '2025-07-12 11:45:00'),
  (1, 1, '2025-07-13 01:15:00', '2025-07-13 04:00:00'),
  (1, 1, '2025-07-14 10:00:00', '2025-07-14 12:00:00'),
  (1, 1, '2025-07-15 15:00:00', '2025-07-15 17:30:00'),
  (1, 1, '2025-07-16 09:00:00', '2025-07-16 11:00:00');

INSERT INTO availability_timeslots (availability_id, status, start_time, end_time) VALUES
  (2, 1, '2025-07-12 01:00:00', '2025-07-12 03:15:00'),
  (2, 1, '2025-07-12 08:00:00', '2025-07-12 10:15:00'),
  (2, 1, '2025-07-13 06:00:00', '2025-07-13 10:00:00'),
  (2, 1, '2025-07-14 15:00:00', '2025-07-14 16:30:00'),
  (2, 1, '2025-07-15 00:30:00', '2025-07-15 04:00:00'),
  (2, 1, '2025-07-16 10:30:00', '2025-07-16 13:45:00');

INSERT INTO availability_timeslots (availability_id, status, start_time, end_time) VALUES
  (3, 1, '2025-07-12 04:15:00', '2025-07-12 06:00:00'),
  (3, 1, '2025-07-12 09:15:00', '2025-07-12 11:15:00'),
  (3, 1, '2025-07-13 03:00:00', '2025-07-13 07:30:00'),
  (3, 1, '2025-07-14 01:00:00', '2025-07-14 03:30:00'),
  (3, 1, '2025-07-15 10:00:00', '2025-07-15 12:15:00'),
  (3, 1, '2025-07-16 13:00:00', '2025-07-16 15:30:00');
