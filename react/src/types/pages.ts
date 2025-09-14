export type MainViewMode =
  | "home"
  | "create"
  | "update-availability"
  | "create-calendar-success";

export type HeaderProps = {
  readonly title: string;
  readonly onClickTitle?: () => void;
};

export type HomeProps = {
  readonly goCreate: () => void;
  readonly onOpenUrl?: (url: string) => void;
};

export type MainViewProps = {
  readonly mode: MainViewMode | null;
  readonly onRequestCreate: () => void;
  readonly onUpdateAvailability: () => void;
  readonly onCreateCalendarSuccess: (url: string) => void;
  readonly createdCalendarUrl?: string;
  readonly scheduleUuid?: string;
  readonly onOpenUrl: (url: string) => void;
};

export type Row = {
  date: string; // "YYYY-MM-DD"
  start: string; // "HH:MM"
  end: string; // "HH:MM"
};

export type TimeslotPayload = {
  start_time: string; // "YYYY-MM-DD HH:MM:SS"
  end_time: string; // "YYYY-MM-DD HH:MM:SS"
};

export type CreateCalendarProps = {
  readonly onCreateCalendarSuccess: (CreateCalendarUrl: string) => void;
};

export type CreateCalendarSuccessProps = {
  createdCalendarUrl: string;
  onUpdateAvailability: () => void;
};

export type SavedTimeslot = {
  id: number;
  start_time: string;
  end_time: string;
};

export type SavedScheduleResponse = {
  uuid: string;
  title: string;
  timeslots: SavedTimeslot[];
};

export type Overlay = {
  schedule_uuid: string;
  schedule_timeslot_id: number;
  date: string;
  name: string;
  start: string;
  end: string;
};

export type ScheduleTimeslot = {
  schedule_uuid: string;
  start_time: string;
  end_time: string;
};

export type ApiScheduleTimeslot = {
  id: number;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
};

export type ApiAvailabilityTimeslot = {
  id: number;
  schedule_timeslot_id: number;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
};

export type ApiAvailability = {
  id: number;
  schedule_uuid: string;
  guest_user_name: string;
  created_at: string;
  updated_at: string;
  availability_timeslots: ApiAvailabilityTimeslot[];
};

export type ApiScheduleWithAvailabilities = {
  uuid: string;
  title: string;
  created_at: string;
  updated_at: string;
  schedule_timeslots: ApiScheduleTimeslot[];
  availabilities: ApiAvailability[];
};

export type DayBlock = {
  scheduleUuid: string;
  timeslotId: number;
  dateKey: string;
  date: Date;
  hours: Date[];
};

export type UpdateAvailabilityProps = {
  scheduleUuid: string | null;
};
