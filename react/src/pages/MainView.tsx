import { Home } from "./Home";
import { CreateCalendar } from "./create-calendar/CreateCalendar";
import { CreateCalendarSuccess } from "./create-calendar-success/CreateCalendarSuccess";
import { UpdateAvailability } from "./update-availability/UpdateAvailability";
import type { MainViewProps } from "../types/pages";

export function MainView({
  mode,
  onRequestCreate,
  onUpdateAvailability,
  onCreateCalendarSuccess,
  createdCalendarUrl,
  scheduleUuid,
  onOpenUrl,
}: MainViewProps) {
  if (scheduleUuid) {
    return (
      <main className="main-view">
        <UpdateAvailability scheduleUuid={scheduleUuid} />
      </main>
    );
  }

  let content: JSX.Element;
  switch (mode) {
    case "create":
      content = (
        <CreateCalendar onCreateCalendarSuccess={onCreateCalendarSuccess} />
      );
      break;
    case "create-calendar-success":
      content = (
        <CreateCalendarSuccess
          createdCalendarUrl={
            createdCalendarUrl ??
            "URL初期値(これが表示されている場合エラーです MainView)"
          }
          onUpdateAvailability={onUpdateAvailability}
        />
      );
      break;
    case "update-availability":
      content = (
        <UpdateAvailability
          scheduleUuid={scheduleUuid ?? "エラー: scheduleUuid が null"}
        />
      );
      break;
    case "home":
    default:
      content = (
        <Home
          goCreate={onRequestCreate}
          goUpdate={onUpdateAvailability}
          onOpenUrl={onOpenUrl}
        />
      );
      break;
  }

  return <main className="main-view">{content}</main>;
}
