import { useState } from "react";
import { Header } from "./Header";
import { MainView } from "./MainView";
import { MainViewMode } from "../types/pagesEnum";
import "../styles/pages.css";

export function AppContainer() {
  const [mode, setMode] = useState<MainViewMode | null>(null);
  const [createdCalendarUrl, setCreatedCalendarUrl] = useState<string>(
    "URL初期値(これが表示されている場合エラーです AppContainer)",
  );

  return (
    <div className="app-container">
      <Header title="日程調整" onClickTitle={() => setMode(null)} />

      <div className="app-container__main">
        <MainView
          mode={mode}
          onRequestCreate={() => setMode(MainViewMode.Create)}
          onRequestUpdate={() => setMode(MainViewMode.Update)}
          onCreateCalendarSuccess={(url: string) => {
            setCreatedCalendarUrl(url);
            setMode(MainViewMode.CreateCalendarSuccess);
          }}
          createdCalendarUrl={createdCalendarUrl}
        />
      </div>
    </div>
  );
}
