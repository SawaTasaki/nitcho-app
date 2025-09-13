import { useState, useEffect } from "react";
import type {
  UpdateAvailabilityProps,
  Overlay,
  ApiScheduleWithAvailabilities,
  DayBlock,
  ApiScheduleTimeslot,
  ScheduleTimeslot,
} from "../../types/pages";
import { toLocalISOString, eachQuarterWithEnd } from "@/utils/datetime";

export const useUpdateAvailability = ({
  scheduleUuid,
}: UpdateAvailabilityProps) => {
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [pendingOverlays, setPendingOverlays] = useState<Overlay[]>([]);
  const [names, setNames] = useState<string[]>(["テストさん"]);
  const [myName, setMyName] = useState<string | null>(null);
  const [myNameInput, setMyNameInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [scheduleTimeslots, setScheduleTimeslots] = useState<
    ScheduleTimeslot[]
  >([]);
  const [selectedOverlay, setSelectedOverlay] = useState<{
    name: string;
    start: Date;
    end: Date;
    dateKey: string;
    scheduleUuid: string;
    timeslotId: number;
  } | null>(null);

  // スケジュールと可用時間を取得
  useEffect(() => {
    async function fetchSchedule() {
      if (!scheduleUuid) return;
      try {
        setLoading(true);
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_ORIGIN}/schedules/${scheduleUuid}/with-availabilities`,
        );
        if (!res.ok) throw new Error("API error: " + res.status);

        const data: ApiScheduleWithAvailabilities = await res.json();

        setScheduleTimeslots(data.schedule_timeslots);

        // overlays に変換
        const loadedOverlays = data.availabilities.flatMap((av) =>
          av.availability_timeslots
            .map((ts) => {
              const parentSlot = data.schedule_timeslots.find(
                (s) => s.id === ts.schedule_timeslot_id,
              );
              if (!parentSlot) return null;
              return {
                schedule_uuid: data.uuid,
                schedule_timeslot_id: ts.schedule_timeslot_id,
                date: parentSlot.start_time.split("T")[0],
                name: av.guest_user_name,
                start: ts.start_time,
                end: ts.end_time,
              };
            })
            .filter(Boolean),
        );
        setOverlays(loadedOverlays as Overlay[]);

        // 名前一覧を state に保存
        const apiNames = Array.from(
          new Set(data.availabilities.map((av) => av.guest_user_name)),
        ).sort((a, b) => a.localeCompare(b, "ja"));
        if (apiNames.length > 0) {
          setNames(apiNames);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchSchedule();
  }, [scheduleUuid]);

  function buildDayBlocks(
    scheduleUuid: string,
    timeslots: ApiScheduleTimeslot[],
  ): DayBlock[] {
    const result: DayBlock[] = [];

    for (const slot of timeslots) {
      const start = new Date(slot.start_time);
      const end = new Date(slot.end_time);

      const dateKey =
        start.getFullYear() +
        "-" +
        String(start.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(start.getDate()).padStart(2, "0");

      const hours = eachQuarterWithEnd(start, end);

      result.push({
        scheduleUuid,
        timeslotId: slot.id,
        dateKey,
        date: start,
        hours,
      });
    }

    result.sort((a, b) => a.date.getTime() - b.date.getTime());
    return result;
  }

  const dayBlocks = scheduleUuid
    ? buildDayBlocks(scheduleUuid, scheduleTimeslots)
    : [];

  // 名前を設定する関数
  const addOrUpdateMyName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      alert("名前を入力してください");
      return;
    }
    if (names.includes(trimmed)) {
      alert("この名前はすでに使われています");
      return;
    }
    setMyName(trimmed); // 新規 or 上書き
    setMyNameInput(""); // 入力欄はクリア
  };

  // 保存処理
  const handleSave = async () => {
    if (!myName) {
      alert("名前を入力してください");
      return;
    }

    if (pendingOverlays.length === 0) {
      alert("保存する予定がありません");
      return;
    }

    // まとめる
    const payload = {
      guest_user_name: myName,
      schedule_uuid: scheduleUuid,
      timeslots: pendingOverlays.map((o: Overlay) => ({
        schedule_timeslot_id: o.schedule_timeslot_id,
        start_time: o.start,
        end_time: o.end,
      })),
    };

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_ORIGIN}/availabilities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) throw new Error("API error: " + res.status);
      const data = await res.json();
      console.log("保存成功", data);

      // 保存できたら pendingOverlays をクリア
      setPendingOverlays([]);
    } catch (err) {
      console.error("保存失敗", err);
    }
  };

  // セルをクリックした時
  const handleCellMouseDown = (
    name: string,
    h: Date,
    dateKey: string,
    scheduleUuid: string,
    timeslotId: number,
  ) => {
    if (!myName) {
      alert("先に自分の名前を追加してください");
      setSelectedOverlay(null);
      return;
    }
    setIsDragging(true);
    setSelectedOverlay({
      name,
      start: h,
      end: h,
      dateKey,
      scheduleUuid,
      timeslotId,
    });
    console.log("=== 開始時間 ===", h);
  };

  // セルにドラッグで入った時
  const handleCellMouseEnter = (
    name: string,
    h: Date,
    scheduleUuid: string,
    dayStart: Date,
    dayEnd: Date,
  ) => {
    if (
      isDragging &&
      selectedOverlay?.name === name &&
      selectedOverlay?.scheduleUuid === scheduleUuid
    ) {
      // 範囲外なら dayStart/dayEnd にクランプ
      const t = h.getTime();
      const lo = dayStart.getTime();
      const hi = dayEnd.getTime();
      const clamped = new Date(Math.max(lo, Math.min(t, hi)));

      setSelectedOverlay((prev) => (prev ? { ...prev, end: clamped } : null));
    }
  };

  // マウスアップで確定
  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
      if (selectedOverlay) {
        const start = selectedOverlay!.start;
        const end = selectedOverlay!.end;
        setPendingOverlays((prev) => [
          ...prev,
          {
            schedule_uuid: selectedOverlay.scheduleUuid,
            schedule_timeslot_id: selectedOverlay.timeslotId,
            date: selectedOverlay.dateKey,
            name: myName!,
            start: toLocalISOString(start),
            end: toLocalISOString(end),
          },
        ]);
        setSelectedOverlay(null);
        console.log("確定:", start, "→", end);
      }
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [selectedOverlay, myName]);

  // myName が変わったら pendingOverlays の名前を更新
  useEffect(() => {
    if (!myName) return;
    setPendingOverlays((prev) =>
      prev.map((o) => ({
        ...o,
        name: myName,
      })),
    );
  }, [myName]);

  return {
    overlays,
    pendingOverlays,
    setPendingOverlays,
    names,
    myName,
    myNameInput,
    setMyNameInput,
    loading,
    isDragging,
    selectedOverlay,
    addOrUpdateMyName,
    handleSave,
    handleCellMouseDown,
    handleCellMouseEnter,
    dayBlocks,
  };
};
