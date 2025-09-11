import { Home } from "./Home";
import { CreateCalendar } from "./create-calendar/CreateCalendar";
import { CreateCalendarSuccess } from "./create-calendar-success/CreateCalendarSuccess";
import { UpdateCalendar } from "./UpdateCalendar";
import type { MainViewProps } from "../types/pages";
import { MainViewMode } from "../types/pagesEnum";

export function MainView({
  mode,
  onRequestCreate,
  onRequestUpdate,
  onCreateCalendarSuccess,
  createdCalendarUrl,
}: MainViewProps) {
  return (
    <main className="main-view">
      {mode === MainViewMode.Create ? (
        <CreateCalendar onCreateCalendarSuccess={onCreateCalendarSuccess} />
      ) : mode === MainViewMode.Update ? (
        <UpdateCalendar />
      ) : mode === MainViewMode.CreateCalendarSuccess ? (
        <CreateCalendarSuccess
          createdCalendarUrl={
            createdCalendarUrl ??
            "URL初期値(これが表示されている場合エラーです MainView)"
          }
          onUpdateAvailability={onRequestUpdate}
        />
      ) : (
        <Home goCreate={onRequestCreate} goUpdate={onRequestUpdate} />
      )}
    </main>
  );
}
