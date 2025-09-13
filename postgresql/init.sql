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
    schedule_timeslot_id INTEGER NOT NULL REFERENCES schedule_timeslots(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

INSERT INTO schedules (uuid, title)
VALUES ('11111111-2222-3333-4444-555555555555', 'テスト用スケジュール');

INSERT INTO schedule_timeslots (schedule_uuid, start_time, end_time)
VALUES
  ('11111111-2222-3333-4444-555555555555', '2025-12-01 09:00:00', '2025-12-01 18:00:00'),
  ('11111111-2222-3333-4444-555555555555', '2025-12-02 08:00:00', '2025-12-02 20:00:00'),
  ('11111111-2222-3333-4444-555555555555', '2025-12-03 06:00:00', '2025-12-03 18:00:00'),
  ('11111111-2222-3333-4444-555555555555', '2025-12-04 10:00:00', '2025-12-04 22:00:00'),
  ('11111111-2222-3333-4444-555555555555', '2025-12-05 12:00:00', '2025-12-06 00:00:00');

INSERT INTO availabilities (schedule_uuid, guest_user_name) VALUES
  ('11111111-2222-3333-4444-555555555555', 'A子'),
  ('11111111-2222-3333-4444-555555555555', 'B子'),
  ('11111111-2222-3333-4444-555555555555', 'C子');

INSERT INTO availability_timeslots (availability_id, schedule_timeslot_id, start_time, end_time) VALUES
  (1, 1, '2025-12-01 09:15:00', '2025-12-01 11:00:00'),
  (1, 1, '2025-12-01 11:15:00', '2025-12-01 12:00:00'),
  (1, 2, '2025-12-02 09:30:00', '2025-12-02 11:45:00'),
  (1, 3, '2025-12-03 07:00:00', '2025-12-03 09:15:00'),
  (1, 3, '2025-12-03 10:30:00', '2025-12-03 12:45:00'),
  (1, 4, '2025-12-04 15:45:00', '2025-12-04 18:30:00'),
  (1, 5, '2025-12-05 13:15:00', '2025-12-05 15:00:00');

INSERT INTO availability_timeslots (availability_id, schedule_timeslot_id, start_time, end_time) VALUES
  (2, 1, '2025-12-01 09:00:00', '2025-12-01 10:30:00'),
  (2, 1, '2025-12-01 10:45:00', '2025-12-01 12:00:00'),
  (2, 2, '2025-12-02 14:15:00', '2025-12-02 16:00:00'),
  (2, 2, '2025-12-02 16:15:00', '2025-12-02 18:45:00'),
  (2, 3, '2025-12-03 08:00:00', '2025-12-03 10:00:00'),
  (2, 4, '2025-12-04 12:30:00', '2025-12-04 15:15:00'),
  (2, 5, '2025-12-05 19:00:00', '2025-12-05 22:00:00');

INSERT INTO availability_timeslots (availability_id, schedule_timeslot_id, start_time, end_time) VALUES
  (3, 1, '2025-12-01 09:45:00', '2025-12-01 11:15:00'),
  (3, 2, '2025-12-02 08:30:00', '2025-12-02 10:15:00'),
  (3, 2, '2025-12-02 10:30:00', '2025-12-02 12:45:00'),
  (3, 3, '2025-12-03 14:00:00', '2025-12-03 15:30:00'),
  (3, 3, '2025-12-03 15:45:00', '2025-12-03 17:15:00'),
  (3, 4, '2025-12-04 18:00:00', '2025-12-04 20:30:00'),
  (3, 5, '2025-12-05 12:15:00', '2025-12-05 14:00:00');
