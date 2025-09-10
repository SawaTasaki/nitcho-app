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
  readonly onRequestUpdate: () => void;
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
