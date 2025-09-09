import React, { useState, useEffect } from "react";

type PendingOverlay = {
  uuid: string;
  schedule_uuid: string;
  date: string;
  name: string;
  start: string;
  end: string;
};

// ===== スタイルを外に定義 =====
const scheduleGridStyles = `
  .schedule-grid-wrapper {
    width: 100%;
    max-width: 90%;
    display: flex;
  flex-direction: column;
  align-items: center;
  }

  .day-block {
    position: relative;
    margin-bottom: 40px;
  }

  .date-label {
  font-weight: bold;
  text-align: center;
  margin-bottom: 8px;
}


  .time-labels {
    position: absolute;
    left: 0;
    top: 48px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    background: white;
  }

  .time-label {
    height: 57px;
  }

  .table-container {
    overflow-x: auto;
    margin-left: 48px;
    border-top: 1px solid #000;
  }

  .table-wrapper {
    position: relative; /* オーバーレイの基準 */
  }

  table {
    border-collapse: collapse;
    position: relative;
  }

  th,
  td {
    border-left: 1px solid #000;
    border-right: 1px solid #000;
    height: 12px;
    text-align: center;
    min-width: 100px;
    position: relative;
  }

  .hour-line td {
    border-top: 1px solid #000;
  }

  .half-hour-line td::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    border-bottom: 1px dashed rgba(0, 0, 0, 0.3);
    pointer-events: none;
  }

  .overlay {
    position: absolute;
    background-color: rgba(0, 0, 255, 0.5);
    pointer-events: auto;
    border-radius: 10px;
  }

  thead th {
    font-weight: bold;
  }

  .no-pe { pointer-events: none !important; }

  .name-input-block {
  margin: 16px 0;
  display: flex;
  gap: 8px;
  justify-content: center; /* 中央寄せにしたい場合 */
}

.name-input {
  font-size: 16px;    /* 文字を大きめに */
  padding: 8px 12px;  /* 内側余白を増やす */
  border: 2px solid #007bff;
  border-radius: 6px;
  min-width: 200px;   /* 存在感アップ */
}

.name-input:focus {
  outline: none;
  border-color: #0056b3;
  box-shadow: 0 0 4px rgba(0, 91, 187, 0.5);
}

.last-row td {
  border-left: none;
  border-right: none;
}

`;

// ====== ダミーデータ ======
type Timeslot = {
  schedule_uuid: string;
  start_time: string;
  end_time: string;
};

const DUMMY_SCHEDULE_TIMESLOTS: Timeslot[] = [
  {
    schedule_uuid: "0000",
    start_time: "2025-07-12 00:00:00",
    end_time: "2025-07-12 06:00:00",
  },
  {
    schedule_uuid: "0001",
    start_time: "2025-07-12 08:00:00",
    end_time: "2025-07-12 12:00:00",
  },
  {
    schedule_uuid: "0002",
    start_time: "2025-07-13 00:00:00",
    end_time: "2025-07-13 12:00:00",
  },
  {
    schedule_uuid: "0003",
    start_time: "2025-07-14 00:00:00",
    end_time: "2025-07-14 18:00:00",
  },
  {
    schedule_uuid: "0004",
    start_time: "2025-07-15 00:00:00",
    end_time: "2025-07-15 24:00:00",
  },
  {
    schedule_uuid: "0005",
    start_time: "2025-07-16 08:00:00",
    end_time: "2025-07-16 20:00:00",
  },
];

const NAMES = ["A子", "B子", "C子", "D子", "E子"];

const OVERLAYS = [
  // === A子 ===
  {
    schedule_uuid: "0000",
    date: "2025-07-12",
    name: "A子",
    start: "2025-07-12 00:30:00",
    end: "2025-07-12 02:45:00",
  },
  {
    schedule_uuid: "0001",
    date: "2025-07-12",
    name: "A子",
    start: "2025-07-12 08:30:00",
    end: "2025-07-12 11:45:00",
  },
  {
    schedule_uuid: "0002",
    date: "2025-07-13",
    name: "A子",
    start: "2025-07-13 01:15:00",
    end: "2025-07-13 04:00:00",
  },
  {
    schedule_uuid: "0003",
    date: "2025-07-14",
    name: "A子",
    start: "2025-07-14 10:00:00",
    end: "2025-07-14 12:00:00",
  },
  {
    schedule_uuid: "0004",
    date: "2025-07-15",
    name: "A子",
    start: "2025-07-15 15:00:00",
    end: "2025-07-15 17:30:00",
  },
  {
    schedule_uuid: "0005",
    date: "2025-07-16",
    name: "A子",
    start: "2025-07-16 09:00:00",
    end: "2025-07-16 11:00:00",
  },

  // === B子 ===
  {
    schedule_uuid: "0000",
    date: "2025-07-12",
    name: "B子",
    start: "2025-07-12 01:00:00",
    end: "2025-07-12 03:15:00",
  },
  {
    schedule_uuid: "0001",
    date: "2025-07-12",
    name: "B子",
    start: "2025-07-12 08:00:00",
    end: "2025-07-12 10:15:00",
  },
  {
    schedule_uuid: "0002",
    date: "2025-07-13",
    name: "B子",
    start: "2025-07-13 06:00:00",
    end: "2025-07-13 10:00:00",
  },
  {
    schedule_uuid: "0003",
    date: "2025-07-14",
    name: "B子",
    start: "2025-07-14 15:00:00",
    end: "2025-07-14 16:30:00",
  },
  {
    schedule_uuid: "0004",
    date: "2025-07-15",
    name: "B子",
    start: "2025-07-15 00:30:00",
    end: "2025-07-15 04:00:00",
  },
  {
    schedule_uuid: "0005",
    date: "2025-07-16",
    name: "B子",
    start: "2025-07-16 10:30:00",
    end: "2025-07-16 13:45:00",
  },

  // === C子 ===
  {
    schedule_uuid: "0000",
    date: "2025-07-12",
    name: "C子",
    start: "2025-07-12 04:15:00",
    end: "2025-07-12 06:00:00",
  },
  {
    schedule_uuid: "0001",
    date: "2025-07-12",
    name: "C子",
    start: "2025-07-12 09:15:00",
    end: "2025-07-12 11:15:00",
  },
  {
    schedule_uuid: "0002",
    date: "2025-07-13",
    name: "C子",
    start: "2025-07-13 03:00:00",
    end: "2025-07-13 07:30:00",
  },
  {
    schedule_uuid: "0003",
    date: "2025-07-14",
    name: "C子",
    start: "2025-07-14 01:00:00",
    end: "2025-07-14 03:30:00",
  },
  {
    schedule_uuid: "0004",
    date: "2025-07-15",
    name: "C子",
    start: "2025-07-15 10:00:00",
    end: "2025-07-15 12:15:00",
  },
  {
    schedule_uuid: "0005",
    date: "2025-07-16",
    name: "C子",
    start: "2025-07-16 13:00:00",
    end: "2025-07-16 15:30:00",
  },
];

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
  dateKey: string;
  date: Date;
  hours: Date[];
};

function buildDayBlocks(timeslots: Timeslot[]): DayBlock[] {
  const result: DayBlock[] = [];

  for (const slot of timeslots) {
    const start = toDate(slot.start_time);
    const end = toDate(slot.end_time);

    const dateKey =
      start.getFullYear() +
      "-" +
      String(start.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(start.getDate()).padStart(2, "0");

    const hours = eachQuarterWithEnd(start, end);

    result.push({
      scheduleUuid: slot.schedule_uuid,
      dateKey,
      date: start,
      hours,
    });
  }

  result.sort((a, b) => a.date.getTime() - b.date.getTime());

  return result;
}

// ====== Component ======
export const UpdateCalendar: React.FC = () => {
  const dayBlocks = buildDayBlocks(DUMMY_SCHEDULE_TIMESLOTS);
  const CELL_WIDTH = 120;
  const [isDragging, setIsDragging] = useState(false);
  const [selectedOverlay, setSelectedOverlay] = useState<{
    name: string;
    start: Date;
    end: Date;
    dateKey: string;
    scheduleUuid: string;
  } | null>(null);
  const [overlays, setOverlays] = useState(OVERLAYS); // 既存
  const [pendingOverlays, setPendingOverlays] = useState<PendingOverlay[]>([]);
  const [pendingIdCounter, setPendingIdCounter] = useState(0);
  const [myName, setMyName] = useState<string | null>(null);
  const [myNameInput, setMyNameInput] = useState("");

  const addOrUpdateMyName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      alert("名前を入力してください");
      return;
    }
    if (NAMES.includes(trimmed)) {
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
    <div className="schedule-grid-wrapper">
      {/* ✅ 常に表示する */}
      <div className="name-input-block">
        <input
          type="text"
          value={myNameInput}
          onChange={(e) => setMyNameInput(e.target.value)}
          placeholder="自分の名前を入力"
          className="name-input"
        />
        <button onClick={() => addOrUpdateMyName(myNameInput)}>
          {myName ? "名前を変更" : "追加"}
        </button>
      </div>

      {dayBlocks.map((day) => (
        <div className="day-block" key={day.scheduleUuid}>
          {/* 日付をテーブル上部に配置 */}
          <div className="date-label">{formatDate(day.date)}</div>

          {/* 時間ラベル */}
          <div className="time-labels">
            {day.hours
              .filter((h) => h.getMinutes() === 0) // ← :00 だけ表示
              .map((h) => (
                <div className="time-label" key={h.toISOString()}>
                  {formatHour(h)}
                </div>
              ))}
          </div>

          {/* グリッドテーブル */}
          <div className="table-container">
            <div className="table-wrapper">
              <table
                className="schedule-day-table"
                style={{
                  minWidth: `${(NAMES.length + (myName ? 1 : 0)) * CELL_WIDTH}px`,
                }}
              >
                <thead>
                  <tr>
                    {NAMES.map((n) => (
                      <th key={n}>{n}</th>
                    ))}
                    {myName && <th>{myName}</th>}
                  </tr>
                </thead>
                <tbody>
                  {day.hours.map((h, rowIndex) => (
                    <tr
                      key={h.toISOString()}
                      className={`
        ${rowIndex % 4 === 0 ? "hour-line" : ""}
        ${rowIndex % 2 === 1 ? "half-hour-line" : ""}
        ${rowIndex === day.hours.length - 1 ? "last-row" : ""}
      `}
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
                      {NAMES.map((n) => (
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
                .filter((o) => o.schedule_uuid === day.scheduleUuid)
                .map((o, i) => {
                  const CELL_HEIGHT = 57;
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
                    o.name === myName ? NAMES.length : NAMES.indexOf(o.name);
                  if (personIndex === -1) return null;

                  return (
                    <div
                      key={i}
                      className="overlay"
                      className={`overlay ${isDragging ? "no-pe" : ""}`}
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
                .map((o, i) => {
                  const CELL_HEIGHT = 57;
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
                      ? NAMES.length
                      : NAMES.indexOf(o.name);
                  if (personIndex === -1) return null;

                  return (
                    <div
                      key={o.uuid}
                      className="overlay"
                      className={`overlay ${isDragging ? "no-pe" : ""}`}
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
                  const CELL_HEIGHT = 57;
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
                      ? NAMES.length
                      : NAMES.indexOf(selectedOverlay.name);
                  if (personIndex === -1) return null;

                  return (
                    <div
                      className="overlay"
                      className={`overlay ${isDragging ? "no-pe" : ""}`}
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

      <style>{scheduleGridStyles}</style>
    </div>
  );
};
