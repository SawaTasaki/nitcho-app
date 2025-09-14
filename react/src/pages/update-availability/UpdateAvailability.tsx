import React from "react";
import { useUpdateAvailability } from "./useUpdateAvailability";
import type { Overlay, UpdateAvailabilityProps } from "../types/pages";
import { formatDate, formatHour } from "@/utils/datetime";
import type { Participant } from "../../types/pages";

export function UpdateAvailability({ scheduleUuid }: UpdateAvailabilityProps) {
  const {
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
  } = useUpdateAvailability({ scheduleUuid });

  const CELL_WIDTH = 120;

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div className="update-calendar">
      <button className="btn btn--primary" onClick={handleSave}>
        カレンダーを確定
      </button>
      <div className="update-calendar__name-input-block">
        <input
          type="text"
          value={myNameInput}
          onChange={(e) => setMyNameInput(e.target.value)}
          placeholder="自分の名前を入力"
          className="input update-calendar__name-input"
        />
        <button
          className="btn btn--ghost"
          onClick={() => addOrUpdateMyName(myNameInput)}
        >
          {myName ? "名前を変更" : "名前を入力"}
        </button>
      </div>

      {dayBlocks.map((day) => (
        <div className="update-calendar__day-block" key={day.timeslotId}>
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
                  minWidth: `${(participants.length + (myName ? 1 : 0)) * CELL_WIDTH}px`,
                }}
              >
                <thead>
                  <tr>
                    {participants.map((p) => (
                      <th key={p.availability_id}>
                        {p.name}
                        <button
                          className="update-calendar__delete-btn"
                          onClick={() =>
                            handleDeleteName(p.name, p.availability_id)
                          }
                          aria-label={`${p.name}を削除`}
                        >
                          ❌
                        </button>
                      </th>
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
                      {participants.map((p: Participant) => (
                        <td key={p.availability_id} />
                      ))}

                      {/* ✅ 自分の列 */}
                      {myName && (
                        <td
                          key={myName + h.toISOString()}
                          onMouseDown={() =>
                            handleCellMouseDown(
                              myName,
                              h,
                              formatDate(day.date),
                              day.scheduleUuid,
                              day.timeslotId,
                            )
                          }
                          onMouseEnter={() =>
                            handleCellMouseEnter({
                              name: myName,
                              h: h,
                              schedule_uuid: day.scheduleUuid,
                              schedule_timeslot_id: day.timeslotId,
                              start: day.hours[0],
                              end: day.hours[day.hours.length - 1],
                            })
                          }
                        />
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 1. 既存 overlays（青 or 自分だけオレンジ） */}
              {overlays
                .filter(
                  (o: Overlay) =>
                    o.schedule_uuid === day.scheduleUuid &&
                    o.schedule_timeslot_id === day.timeslotId,
                )
                .map((o: Overlay) => {
                  const key = `${o.schedule_timeslot_id}-${o.name}-${o.start}-${o.end}`;
                  const CELL_HEIGHT = 56;
                  const start = new Date(o.start);
                  const end = new Date(o.end);
                  const startOffsetMs =
                    start.getTime() - day.hours[0].getTime();
                  const slotIndex = Math.round(
                    startOffsetMs / (1000 * 60 * 15),
                  );
                  const top = 25 + (slotIndex * CELL_HEIGHT) / 4;
                  const durationInMs = end.getTime() - start.getTime();
                  const height =
                    (durationInMs / (1000 * 60 * 60)) * CELL_HEIGHT;
                  const personIndex =
                    o.name === myName
                      ? participants.length
                      : participants.findIndex(
                          (p: Participant) => p.name === o.name,
                        );
                  if (personIndex === -1) return null;

                  return (
                    <div
                      key={key}
                      className={[
                        "update-calendar__overlay",
                        o.name === myName
                          ? "update-calendar__overlay--mine"
                          : "update-calendar__overlay--others",
                        isDragging ? "update-calendar__overlay--no-pe" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={{
                        top,
                        left: personIndex * CELL_WIDTH,
                        height,
                        width: CELL_WIDTH,
                      }}
                    />
                  );
                })}

              {/* 2. pendingOverlays（全部オレンジで表示） */}
              {pendingOverlays
                .filter((o: Overlay) => o.schedule_uuid === day.scheduleUuid)
                .map((o: Overlay) => {
                  const CELL_HEIGHT = 56;
                  const start = new Date(o.start);
                  const end = new Date(o.end);

                  const startOffsetMs =
                    start.getTime() - day.hours[0].getTime();
                  const startOffsetMin = startOffsetMs / (1000 * 60);

                  const slotIndex = Math.round(startOffsetMin / 15);
                  const top = 25 + (slotIndex * CELL_HEIGHT) / 4;

                  const durationInMs = end.getTime() - start.getTime();
                  const height =
                    (durationInMs / (1000 * 60 * 60)) * CELL_HEIGHT;

                  // 🔽 修正: myName の場合は右端の列
                  const personIndex =
                    myName && o.name === myName
                      ? participants.length
                      : participants.findIndex(
                          (p: Participant) => p.name === o.name,
                        );
                  if (personIndex === -1) return null;

                  return (
                    <div
                      key={`${o.schedule_timeslot_id}-${o.name}-${o.start}-${o.end}`}
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
                          prev.filter(
                            (p) =>
                              !(
                                p.schedule_timeslot_id ===
                                  o.schedule_timeslot_id &&
                                p.name === o.name &&
                                p.start === o.start &&
                                p.end === o.end
                              ),
                          ),
                        );
                      }}
                    />
                  );
                })}

              {/* 3. 今ドラッグ中（selectedOverlay、一時表示） */}
              {selectedOverlay &&
                selectedOverlay.date === formatDate(day.date) &&
                (() => {
                  const CELL_HEIGHT = 56;
                  const start = new Date(selectedOverlay.start);
                  const end = new Date(selectedOverlay.end);

                  const startOffsetMs =
                    start.getTime() - day.hours[0].getTime();
                  const startOffsetMin = startOffsetMs / (1000 * 60);
                  const slotIndex = Math.round(startOffsetMin / 15);
                  const top = 25 + (slotIndex * CELL_HEIGHT) / 4;

                  const durationInMs = end.getTime() - start.getTime();
                  const height =
                    (durationInMs / (1000 * 60 * 60)) * CELL_HEIGHT;

                  const personIndex =
                    selectedOverlay.name === myName
                      ? participants.length
                      : participants.findIndex(
                          (p: Participant) => p.name === selectedOverlay.name,
                        );
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
}
