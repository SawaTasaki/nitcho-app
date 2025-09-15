import { useState, useEffect } from "react";
import type {
  UpdateAvailabilityProps,
  Overlay,
  ApiScheduleWithAvailabilities,
  DayBlock,
  ApiScheduleTimeslot,
  ScheduleTimeslot,
  HandleCellMouseEnterArgs,
  Participant,
} from "../../types/pages";
import {
  toLocalISOString,
  eachQuarterWithEnd,
  formatDate,
  intersectIntervals,
} from "@/utils/datetime";

export const useUpdateAvailability = ({
  scheduleUuid,
}: UpdateAvailabilityProps) => {
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [pendingOverlays, setPendingOverlays] = useState<Overlay[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([
    { availability_id: -1, name: "テストさん" },
  ]);
  const [myName, setMyName] = useState<string | null>(null);
  const [myNameInput, setMyNameInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [scheduleTimeslots, setScheduleTimeslots] = useState<
    ScheduleTimeslot[]
  >([]);
  const [selectedOverlay, setSelectedOverlay] = useState<Overlay | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSchedule() {
      if (!scheduleUuid) return;
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_ORIGIN}/schedules/${scheduleUuid}/with-availabilities`,
        );

        if (!res.ok) {
          if (res.status === 404) {
            setError("不正なURLです");
          } else if (res.status === 422) {
            setError("不正なURLです");
          } else {
            setError(`不正なURLです (${res.status})`);
          }
          return;
        }

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

        const apiParticipants: Participant[] = data.availabilities
          .slice()
          .sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          )
          .map((av) => ({
            availability_id: av.id,
            name: av.guest_user_name,
          }));

        if (apiParticipants.length > 0) {
          setParticipants(apiParticipants);
        }
      } catch (err) {
        console.error(err);
        setError("スケジュールの取得中にエラーが発生しました");
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
    if (participants.some((p: Participant) => p.name === trimmed)) {
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

      const createdCalendarUrl = `${window.location.origin}/?schedule-uuid=${scheduleUuid}`;
      window.location.href = createdCalendarUrl;
    } catch (err) {
      console.error("保存失敗", err);
    }
  };

  const handleDeleteName = async (
    targetName: string,
    availabilityId: number,
    scheduleUuid: string,
  ) => {
    if (participants.length <= 1) {
      alert("最後の一人は削除できません");
      return;
    }

    const confirmed = window.confirm(
      `本当に「${targetName}」さんの予定を削除しますか？`,
    );
    if (!confirmed) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_ORIGIN}/availabilities/${availabilityId}?schedule_uuid=${scheduleUuid}`,
        { method: "DELETE" },
      );

      if (!res.ok) throw new Error("削除失敗");

      setParticipants((prev: Participant[]) =>
        prev.filter((p) => p.availability_id !== availabilityId),
      );
      setOverlays((prev: Overlay[]) =>
        prev.filter((o) => o.name !== targetName),
      );
    } catch (err) {
      console.error(err);
      alert("削除に失敗しました");
    }
  };

  function getCommonAvailability(
    overlays: Overlay[],
    participants: Participant[],
  ) {
    const byDate: Record<string, Overlay[]> = {};
    overlays.forEach((o) => {
      const key = formatDate(new Date(o.date)); // ←ここで統一
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push(o);
    });

    const results: Record<string, { start: Date; end: Date }[]> = {};

    for (const date in byDate) {
      const dayOverlays = byDate[date];

      const grouped = participants.map((p) =>
        dayOverlays
          .filter((o) => o.name === p.name)
          .map((o) => ({
            start: new Date(o.start),
            end: new Date(o.end),
          })),
      );

      if (grouped.some((g) => g.length === 0)) continue;

      let intersection = grouped[0];
      for (let i = 1; i < grouped.length; i++) {
        intersection = intersectIntervals(intersection, grouped[i]);
        if (intersection.length === 0) break;
      }

      results[date] = intersection;
    }

    return results;
  }

  const commonAvailability = getCommonAvailability(overlays, participants);

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
  const handleCellMouseEnter = ({
    name,
    h,
    schedule_uuid,
    schedule_timeslot_id,
    start,
    end,
  }: HandleCellMouseEnterArgs) => {
    if (
      isDragging &&
      selectedOverlay?.name === name &&
      selectedOverlay?.schedule_uuid === schedule_uuid &&
      selectedOverlay?.schedule_timeslot_id === schedule_timeslot_id // ← 追加
    ) {
      // 範囲内に収める
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
    participants,
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
    error,
    handleDeleteName,
    commonAvailability,
  };
};
