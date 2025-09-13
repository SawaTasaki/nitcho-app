import React, { useState, useEffect } from "react";

type PendingOverlay = {
  uuid: string;
  schedule_uuid: string;
  schedule_timeslot_id: number;
  date: string;
  name: string;
  start: string;
  end: string;
};

type Timeslot = {
  schedule_uuid: string;
  start_time: string;
  end_time: string;
};

type ApiScheduleTimeslot = {
  id: number;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
};

type ApiAvailabilityTimeslot = {
  id: number;
  schedule_timeslot_id: number;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
};

type ApiAvailability = {
  id: number;
  schedule_uuid: string;
  guest_user_name: string;
  created_at: string;
  updated_at: string;
  availability_timeslots: ApiAvailabilityTimeslot[];
};

type ApiScheduleWithAvailabilities = {
  uuid: string;
  title: string;
  created_at: string;
  updated_at: string;
  schedule_timeslots: ApiScheduleTimeslot[];
  availabilities: ApiAvailability[];
};

// ====== Utility ======

// 例："2025-07-14 10:00:00" → "2025-07-14T10:00:00"
function toDate(s: string) {
  return new Date(s.replace(" ", "T"));
}

// 例："2025-07-14" → "2025/07/14"
function formatDate(d: Date) {
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

// 例："2025-07-14T05:07:00" → "05:07"
function formatHour(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// 例："2025-07-12T00:00:00"〜"2025-07-12T01:00:00" → "2025-07-12T00:00:00", "2025-07-12T00:15:00", "2025-07-12T00:30:00", "2025-07-12T00:45:00", "2025-07-12T01:00:00"
function eachQuarterWithEnd(start: Date, end: Date): Date[] {
  const times: Date[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    times.push(new Date(cur));
    cur.setMinutes(cur.getMinutes() + 15);
  }
  return times;
}

type DayBlock = {
  scheduleUuid: string;
  timeslotId: number;
  dateKey: string;
  date: Date;
  hours: Date[];
};

function buildDayBlocks(scheduleUuid: string, timeslots: ApiScheduleTimeslot[]): DayBlock[] {
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

type UpdateAvailabilityProps = {
  scheduleUuid: string | null;
};

// ====== Component ======
export function UpdateAvailability({scheduleUuid,}: UpdateAvailabilityProps) {
  const CELL_WIDTH = 120;
  const [isDragging, setIsDragging] = useState(false);
  const [selectedOverlay, setSelectedOverlay] = useState<{
    name: string;
    start: Date;
    end: Date;
    dateKey: string;
    scheduleUuid: string;
  } | null>(null);
  const [overlays, setOverlays] = useState<PendingOverlay[]>([]);
  const [pendingOverlays, setPendingOverlays] = useState<PendingOverlay[]>([]);
  const [pendingIdCounter, setPendingIdCounter] = useState(0);
  const [myName, setMyName] = useState<string | null>(null);
  const [myNameInput, setMyNameInput] = useState("");
  const [names, setNames] = useState<string[]>(["テストさん"]);

  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSchedule() {
      try {
        setLoading(true);
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_ORIGIN}/schedules/${scheduleUuid}/with-availabilities`
        );
        if (!res.ok) throw new Error("API error: " + res.status);
  
        const data: ApiScheduleWithAvailabilities = await res.json();
        console.log("取得したデータ", data);
  
        // timeslots
        setTimeslots(data.schedule_timeslots);
  
        // overlays に変換（全員分）
        const loadedOverlays = data.availabilities.flatMap(av =>
          av.availability_timeslots.map(ts => {
            const parentSlot = data.schedule_timeslots.find(
              s => s.id === ts.schedule_timeslot_id
            );
            if (!parentSlot) return null;
            return {
              uuid: String(ts.id),
              schedule_uuid: data.uuid,
              schedule_timeslot_id: ts.schedule_timeslot_id,
              date: parentSlot.start_time.split("T")[0],
              name: av.guest_user_name,
              start: ts.start_time,
              end: ts.end_time,
            };
          }).filter(Boolean)
        );
        setOverlays(loadedOverlays as PendingOverlay[]);
    
        // 名前一覧を state に保存
        const apiNames = Array.from(new Set(data.availabilities.map(av => av.guest_user_name))).sort((a, b) => a.localeCompare(b, "ja"));
        if (apiNames.length > 0) {
          setNames(apiNames);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  
    if (scheduleUuid) {
      fetchSchedule();
    }
  }, [scheduleUuid]);
  
  const dayBlocks = scheduleUuid ? buildDayBlocks(scheduleUuid, timeslots) : [];

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

  // セルをクリックした時
  const handleCellMouseDown = (
    name: string,
    h: Date,
    dateKey: string,
    scheduleUuid: string,
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
      selectedOverlay?.scheduleUuid === scheduleUuid // ✅ uuid だけチェック
    ) {
      // 範囲外なら dayStart/dayEnd にクランプ
      const t = h.getTime();
      const lo = dayStart.getTime();
      const hi = dayEnd.getTime();
      const clamped = new Date(Math.max(lo, Math.min(t, hi)));

      setSelectedOverlay((prev) => (prev ? { ...prev, end: clamped } : null));
    }
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
      if (selectedOverlay) {
        const start = selectedOverlay!.start;
        const end = selectedOverlay!.end;
        setPendingOverlays((prev) => [
          ...prev,
          {
            uuid: String(pendingIdCounter),
            schedule_uuid: selectedOverlay.scheduleUuid,
            date: selectedOverlay.dateKey,
            name: myName!,
            start: start.toISOString(),
            end: end.toISOString(),
          },
        ]);
        setPendingIdCounter((prev) => prev + 1);
        setSelectedOverlay(null);
        console.log("確定:", start, "→", end);
      }
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [selectedOverlay, dayBlocks, myName, pendingIdCounter]);

  useEffect(() => {
    if (!myName) return;
    setPendingOverlays((prev) =>
      prev.map((o) => ({
        ...o,
        name: myName,
      })),
    );
  }, [myName]);

  return (
    <div className="update-calendar">
      {/* ✅ 常に表示する */}
      <div className="update-calendar__name-input-block">
        <input
          type="text"
          value={myNameInput}
          onChange={(e) => setMyNameInput(e.target.value)}
          placeholder="自分の名前を入力"
          className="update-calendar__name-input"
        />
        <button onClick={() => addOrUpdateMyName(myNameInput)}>
          {myName ? "名前を変更" : "追加"}
        </button>
      </div>

      {dayBlocks.map((day) => (
        <div className="update-calendar__day-block" key={`${day.scheduleUuid}-${day.dateKey}`}>
          {/* 日付をテーブル上部に配置 */}
          <div className="update-calendar__date-label">
            {formatDate(day.date)}
          </div>

          {/* 時間ラベル */}
          <div className="update-calendar__time-labels">
            {day.hours
              .filter((h) => h.getMinutes() === 0) // ← :00 だけ表示
              .map((h) => (
                <div
                  className="update-calendar__time-label"
                  key={h.toISOString()}
                >
                  {formatHour(h)}
                </div>
              ))}
          </div>

          {/* グリッドテーブル */}
          <div className="update-calendar__table-container">
            <div className="update-calendar__table-wrapper">
              <table
                className="update-calendar__day-table"
                style={{
                  minWidth: `${(names.length + (myName ? 1 : 0)) * CELL_WIDTH}px`,
                }}
              >
                <thead>
                  <tr>
                    {names.map((n) => (
                      <th key={n}>{n}</th>
                    ))}
                    {myName && <th>{myName}</th>}
                  </tr>
                </thead>
                <tbody>
                  {day.hours.map((h, rowIndex) => (
                    <tr
                      key={h.toISOString()}
                      className={[
                        rowIndex % 4 === 0
                          ? "update-calendar__row--hour-line"
                          : "",
                        rowIndex % 2 === 1
                          ? "update-calendar__row--half-hour-line"
                          : "",
                        rowIndex === day.hours.length - 1
                          ? "update-calendar__row--last-row"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={
                        rowIndex === day.hours.length - 1
                          ? {
                              height: 0,
                              opacity: 0,
                              border: "none",
                              pointerEvents: "auto",
                            }
                          : undefined
                      }
                    >
                      {names.map((n) => (
                        <td key={n + h.toISOString()} />
                      ))}

                      {/* ✅ 自分の列 */}
                      {myName && (
                        <td
                          key={myName + h.toISOString()}
                          onMouseDown={() =>
                            handleCellMouseDown(
                              myName,
                              h,
                              day.dateKey,
                              day.scheduleUuid,
                            )
                          }
                          onMouseEnter={() =>
                            handleCellMouseEnter(
                              myName,
                              h,
                              day.scheduleUuid,
                              day.hours[0],
                              day.hours[day.hours.length - 1],
                            )
                          }
                        />
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 1. 既存 overlays（青 or 自分だけオレンジ） */}
              {overlays
                .filter(o =>
                  o.schedule_uuid === day.scheduleUuid &&
                  o.schedule_timeslot_id === day.timeslotId
                )
                .map((o, i) => {
                  const CELL_HEIGHT = 56;
                  const start = new Date(o.start);
                  const end = new Date(o.end);
                  const startOffsetMs =
                    start.getTime() - day.hours[0].getTime();
                  const slotIndex = Math.round(
                    startOffsetMs / (1000 * 60 * 15),
                  );
                  const top = 27 + (slotIndex * CELL_HEIGHT) / 4;
                  const durationInMs = end.getTime() - start.getTime();
                  const height =
                    (durationInMs / (1000 * 60 * 60)) * CELL_HEIGHT;
                  const personIndex =
                    o.name === myName ? names.length : names.indexOf(o.name);
                  if (personIndex === -1) return null;

                  return (
                    <div
                      key={i}
                      className={[
                        "update-calendar__overlay",
                        isDragging ? "update-calendar__overlay--no-pe" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={{
                        top,
                        left: personIndex * CELL_WIDTH,
                        height,
                        width: CELL_WIDTH,
                        backgroundColor:
                          o.name === myName
                            ? "rgba(255, 165, 0, 0.5)" // 自分はオレンジ
                            : "rgba(0, 0, 255, 0.5)", // 他人は青
                      }}
                    />
                  );
                })}

              {/* 2. pendingOverlays（全部オレンジで表示） */}
              {pendingOverlays
                .filter((o) => o.schedule_uuid === day.scheduleUuid)
                .map((o) => {
                  const CELL_HEIGHT = 56;
                  const start = new Date(o.start);
                  const end = new Date(o.end);

                  const startOffsetMs =
                    start.getTime() - day.hours[0].getTime();
                  const startOffsetMin = startOffsetMs / (1000 * 60);

                  const slotIndex = Math.round(startOffsetMin / 15);
                  const top = 27 + (slotIndex * CELL_HEIGHT) / 4;

                  const durationInMs = end.getTime() - start.getTime();
                  const height =
                    (durationInMs / (1000 * 60 * 60)) * CELL_HEIGHT;

                  // 🔽 修正: myName の場合は右端の列
                  const personIndex =
                    myName && o.name === myName
                      ? names.length
                      : names.indexOf(o.name);
                  if (personIndex === -1) return null;

                  return (
                    <div
                      key={o.uuid}
                      className={[
                        "update-calendar__overlay",
                        isDragging ? "update-calendar__overlay--no-pe" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={{
                        top,
                        left: personIndex * CELL_WIDTH,
                        height,
                        width: CELL_WIDTH,
                        backgroundColor: "rgba(255,165,0,0.7)", // オレンジ（未確定）
                      }}
                      onClick={() => {
                        setPendingOverlays((prev) =>
                          prev.filter((p) => p.uuid !== o.uuid),
                        );
                      }}
                    />
                  );
                })}

              {/* 3. 今ドラッグ中（selectedOverlay、一時表示） */}
              {selectedOverlay &&
                selectedOverlay.dateKey === day.dateKey &&
                (() => {
                  const CELL_HEIGHT = 56;
                  const start = selectedOverlay.start;
                  const end = selectedOverlay.end;

                  const startOffsetMs =
                    start.getTime() - day.hours[0].getTime();
                  const startOffsetMin = startOffsetMs / (1000 * 60);
                  const slotIndex = Math.round(startOffsetMin / 15);
                  const top = 27 + (slotIndex * CELL_HEIGHT) / 4;

                  const durationInMs = end.getTime() - start.getTime();
                  const height =
                    (durationInMs / (1000 * 60 * 60)) * CELL_HEIGHT;

                  const personIndex =
                    selectedOverlay.name === myName
                      ? names.length
                      : names.indexOf(selectedOverlay.name);
                  if (personIndex === -1) return null;

                  return (
                    <div
                      className={[
                        "update-calendar__overlay",
                        isDragging ? "update-calendar__overlay--no-pe" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={{
                        top,
                        left: personIndex * CELL_WIDTH,
                        height,
                        width: CELL_WIDTH,
                        backgroundColor: "rgba(255, 165, 0, 0.5)", // orange semi-transparent
                      }}
                    />
                  );
                })()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
