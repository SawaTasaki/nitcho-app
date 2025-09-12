import { Home } from "./Home";
import { CreateCalendar } from "./create-calendar/CreateCalendar";
import { CreateCalendarSuccess } from "./create-calendar-success/CreateCalendarSuccess";
import { UpdateAvailability } from "./update-availability/UpdateAvailability";
import type { MainViewProps } from "../types/pages";
import { MainViewMode } from "../types/pagesEnum";

export function MainView({
  mode,
  onRequestCreate,
  onUpdateAvailability,
  onCreateCalendarSuccess,
  createdCalendarUrl,
  scheduleUuid,
}: MainViewProps) {
  return (
    <main className="main-view">
      {scheduleUuid ? (
        <UpdateAvailability scheduleUuid={scheduleUuid} />
      ) : mode === MainViewMode.Create ? (
        <CreateCalendar onCreateCalendarSuccess={onCreateCalendarSuccess} />
      ) : mode === MainViewMode.CreateCalendarSuccess ? (
        <CreateCalendarSuccess
          createdCalendarUrl={
            createdCalendarUrl ??
            "URL初期値(これが表示されている場合エラーです MainView)"
          }
          onUpdateAvailability={onUpdateAvailability}
        />
      ) : (
        <Home goCreate={onRequestCreate} goUpdate={onUpdateAvailability} />
      )}
    </main>
  );
}
