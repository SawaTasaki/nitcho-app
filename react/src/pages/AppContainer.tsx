import { useState } from "react";
import { Header } from "./Header";
import { MainView, MainViewMode } from "./MainView";

export function AppContainer() {
  const [mode, setMode] = useState<MainViewMode | null>(null);

  return (
    <div className="app-container">
      <Header title="日程調整" onClickTitle={() => setMode(null)} />

      <div className="app-container__main">
        <MainView
          mode={mode}
          onRequestCreate={() => setMode("create")}
          onRequestUpdate={() => setMode("update")}
        />
      </div>
    </div>
  );
}
