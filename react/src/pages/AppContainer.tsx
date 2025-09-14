import { useState, useEffect } from "react";
import { Header } from "./Header";
import { MainView } from "./MainView";
import { MainViewMode } from "../types/pagesEnum";
import "../styles/pages.css";

export function AppContainer() {
  const [mode, setMode] = useState<MainViewMode | null>(null);
  const [createdCalendarUrl, setCreatedCalendarUrl] = useState<string>(
    "URL初期値(これが表示されている場合エラーです AppContainer)",
  );
  const [scheduleUuid, setScheduleUuid] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const value = params.get("schedule-uuid");
    setScheduleUuid(value);
  }, []);

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
          onRequestCreate={() => setMode("create")}
          onUpdateAvailability={() => setMode("update-availability")}
          onCreateCalendarSuccess={(url: string) => {
            setCreatedCalendarUrl(url);
            setMode("create-calendar-success");
          }}
          createdCalendarUrl={createdCalendarUrl}
          scheduleUuid={scheduleUuid}
        />
      </div>
    </div>
  );
}
