import { useState } from "react";
import { Header } from "./Header";
import { MainView } from "./MainView";
import { MainViewMode } from "../types/pagesEnum";

export function AppContainer() {
  const [mode, setMode] = useState<MainViewMode | null>(null);

  return (
    <div className="app-container">
      <Header title="日程調整" onClickTitle={() => setMode(null)} />

      <div className="app-container__main">
        <MainView
          mode={mode}
          onRequestCreate={() => setMode(MainViewMode.Create)}
          onRequestUpdate={() => setMode(MainViewMode.Update)}
        />
      </div>
    </div>
  );
}
