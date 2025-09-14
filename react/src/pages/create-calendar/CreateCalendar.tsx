import React from "react";
import { useCreateCalendar } from "./useCreateCalendar";
import type { CreateCalendarProps } from "../types/pages";

export function CreateCalendar({
  onCreateCalendarSuccess,
}: CreateCalendarProps) {
  const {
    rows,
    isSubmitting,
    handleChange,
    handleAdd,
    handleDelete,
    handleSave,
    title,
    setTitle,
  } = useCreateCalendar({ onCreateCalendarSuccess: onCreateCalendarSuccess });

  return (
    <div className="calendar">
      <div className="calendar__header">
        <div className="calendar__header-inner">
          <h2 className="calendar__title">カレンダー新規作成</h2>

          <div className="calendar__actions">
            <button
              type="button"
              onClick={handleAdd}
              className="calendar__btn calendar__btn--ghost"
              disabled={isSubmitting}
            >
              追加
            </button>
            <button
              type="submit"
              className="calendar__btn calendar__btn--primary"
              form="calendar-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? "保存中..." : "保存"}
            </button>
          </div>
        </div>
      </div>

      <form id="calendar-form" onSubmit={handleSave} className="calendar__form">
      <div className="calendar__title-field">
          <input
            className="calendar__input"
            type="text"
            placeholder="スケジュールのタイトルを入力"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="calendar__rows">
          {rows.map((row, idx) => (
            <div key={idx} className="calendar__row-card">
              <div className="calendar__row-grid">
                <div className="calendar__field">
                  <div className="calendar__label">日付</div>
                  <input
                    className="calendar__input"
                    type="date"
                    value={row.date}
                    onChange={(e) => handleChange(idx, "date", e.target.value)}
                  />
                </div>

                <div className="calendar__field">
                  <div className="calendar__label">開始時刻</div>
                  <input
                    className="calendar__input"
                    type="time"
                    step={900}
                    value={row.start}
                    onChange={(e) => handleChange(idx, "start", e.target.value)}
                  />
                </div>

                <div className="calendar__field">
                  <div className="calendar__label">終了時刻</div>
                  <input
                    className="calendar__input"
                    type="time"
                    step={900}
                    value={row.end}
                    onChange={(e) => handleChange(idx, "end", e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  aria-label="行を削除"
                  className="calendar__delete-btn"
                  onClick={() => handleDelete(idx)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}
