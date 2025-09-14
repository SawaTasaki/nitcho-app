import { Header } from "../Header";
import { MainView } from "../MainView";
import { useAppContainer } from "./useAppContainer";
import "../../styles/pages.css";

export function AppContainer() {
  const {
    mode,
    scheduleUuid,
    createdCalendarUrl,
    handleRequestCreate,
    handleUpdateAvailability,
    handleCreateCalendarSuccess,
    handleOpenUrl,
  } = useAppContainer();

  return (
    <div className="app-container">
      <Header
        title="日程調整"
        onClickTitle={() => {
          window.location.href = "/";
        }}
      />

      <div className="app-container__main">
        <MainView
          mode={mode}
          onRequestCreate={handleRequestCreate}
          onUpdateAvailability={handleUpdateAvailability}
          onCreateCalendarSuccess={handleCreateCalendarSuccess}
          onOpenUrl={handleOpenUrl}
          createdCalendarUrl={createdCalendarUrl}
          scheduleUuid={scheduleUuid}
        />
      </div>
    </div>
  );
}
