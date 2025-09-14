// src/hooks/useAppContainer.ts
import { useState, useEffect } from "react";
import type { MainViewMode } from "../types/pages";

export function useAppContainer() {
  const [mode, setMode] = useState<MainViewMode | null>(null);
  const [createdCalendarUrl, setCreatedCalendarUrl] = useState<string>(
    "URL初期値(これが表示されている場合エラーです AppContainer)",
  );
  const [scheduleUuid, setScheduleUuid] = useState<string | null>(null);

  // 初期ロードで ?schedule-uuid を拾う
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const value = params.get("schedule-uuid");
    setScheduleUuid(value);
  }, []);

  // ハンドラ群
  const handleRequestCreate = () => setMode("create");

  const handleUpdateAvailability = () => setMode("update-availability");

  const handleCreateCalendarSuccess = (url: string) => {
    setCreatedCalendarUrl(url);
    setMode("create-calendar-success");
  };

  const handleOpenUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      const uuid = parsed.searchParams.get("schedule-uuid");
      if (uuid) {
        window.location.href = url; // ← 遷移
      } else {
        alert("URLに schedule-uuid が含まれていません");
      }
    } catch {
      alert("不正なURLです");
    }
  };

  return {
    mode,
    scheduleUuid,
    createdCalendarUrl,
    handleRequestCreate,
    handleUpdateAvailability,
    handleCreateCalendarSuccess,
    handleOpenUrl,
  };
}
