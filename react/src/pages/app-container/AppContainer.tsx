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
    handleCreateCalendarSuccess,
    handleOpenUrl,
  } = useAppContainer();

  return (
    <div className="app-container">
      <Header
        title="日程調整マン"
        onClickTitle={() => {
          window.location.href = "/";
        }}
      />

      <div className="app-container__main">
        <MainView
          mode={mode}
          onRequestCreate={handleRequestCreate}
          onCreateCalendarSuccess={handleCreateCalendarSuccess}
          onOpenUrl={handleOpenUrl}
          createdCalendarUrl={createdCalendarUrl}
          scheduleUuid={scheduleUuid}
        />
      </div>
    </div>
  );
}
