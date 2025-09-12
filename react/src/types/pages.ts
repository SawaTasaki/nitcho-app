import type { MainViewMode } from "./pagesEnum";

export type HeaderProps = {
  readonly title: string;
  readonly onClickTitle?: () => void;
};

export type HomeProps = {
  readonly goCreate: () => void;
  readonly goUpdate: () => void;
  readonly onOpenUrl?: (url: string) => void;
};

export type MainViewProps = {
  readonly mode: MainViewMode | null;
  readonly onRequestCreate: () => void;
  readonly onUpdateAvailability: () => void;
  readonly onCreateCalendarSuccess: (url: string) => void;
  readonly createdCalendarUrl?: string;
  readonly scheduleUuid?: string,
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
