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
  const [selectedOverlay, setSelectedOverlay] = useState<Overlay | null>(null);

  useEffect(() => {
    async function fetchSchedule() {
      if (!scheduleUuid) return;
      try {
        setLoading(true);
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_ORIGIN}/schedules/${scheduleUuid}/with-availabilities`,
        );
        if (!res.ok)
          throw new Error(
            "バックエンドからデータを取得する際にエラーが発生しました: " +
              res.status,
          );

        const data: ApiScheduleWithAvailabilities = await res.json();

        setScheduleTimeslots(data.schedule_timeslots);

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

        const apiNames = data.availabilities
          .slice()
          .sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          )
          .reduce<string[]>((acc, av) => {
            if (!acc.includes(av.guest_user_name)) {
              acc.push(av.guest_user_name);
            }
            return acc;
          }, []);

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
      const hours = eachQuarterWithEnd(start, end);

      result.push({
        scheduleUuid,
        timeslotId: slot.id,
        date: start,
        hours,
      });
    }

    result.sort((a, b) => a.date.getTime() - b.date.getTime());

    console.log("result", result);
    return result;
  }

  const dayBlocks = scheduleUuid
    ? buildDayBlocks(scheduleUuid, scheduleTimeslots)
    : [];

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
    setMyName(trimmed);
    setMyNameInput("");
  };

  const handleSave = async () => {
    if (!myName) {
      alert("名前を入力してください");
      return;
    }

    if (pendingOverlays.length === 0) {
      alert("保存する予定がありません");
      return;
    }

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

      if (!res.ok)
        throw new Error(
          "Aバックエンドにデータを保存する際にエラーが発生しました: " +
            res.status,
        );
      const data = await res.json();
      console.log("保存成功", data);
      setPendingOverlays([]);
    } catch (err) {
      console.error("保存失敗", err);
    }
  };

  // セルをクリックした時
  const handleCellMouseDown = (
    name: string,
    h: Date,
    date: string,
    schedule_uuid: string,
    schedule_timeslot_id: number,
  ) => {
    if (!myName) {
      alert("先に自分の名前を追加してください");
      setSelectedOverlay(null);
      return;
    }
    setIsDragging(true);
    setSelectedOverlay({
      schedule_uuid,
      schedule_timeslot_id,
      date,
      name,
      start: h.toISOString(),
      end: h.toISOString(),
    });
    console.log("=== 開始時間 ===", h);
  };

  // セルにドラッグで入った時
  const handleCellMouseEnter = (
    name: string,
    h: Date,
    schedule_uuid: string,
    start: Date,
    end: Date,
  ) => {
    if (
      isDragging &&
      selectedOverlay?.name === name &&
      selectedOverlay?.schedule_uuid === schedule_uuid
    ) {
      // 範囲外なら dayStart/dayEnd にクランプ
      const t = h.getTime();
      const lo = start.getTime();
      const hi = end.getTime();
      const clamped = new Date(Math.max(lo, Math.min(t, hi)));

      setSelectedOverlay((prev: Overlay | null) =>
        prev ? { ...prev, end: clamped.toISOString() } : null,
      );
    }
  };

  // マウスアップで確定
  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
      if (selectedOverlay) {
        const start = selectedOverlay!.start;
        const end = selectedOverlay!.end;
        setPendingOverlays((prev: Overlay[]) => [
          ...prev,
          {
            schedule_uuid: selectedOverlay.schedule_uuid,
            schedule_timeslot_id: selectedOverlay.schedule_timeslot_id,
            date: selectedOverlay.date,
            name: myName!,
            start: toLocalISOString(new Date(selectedOverlay.start)),
            end: toLocalISOString(new Date(selectedOverlay.end)),
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
    setPendingOverlays((prev: Overlay[]) =>
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
