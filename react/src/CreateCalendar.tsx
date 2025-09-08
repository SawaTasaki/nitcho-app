import { useState } from "react";
import "./styles/CreateCalendar.css";

type Row = {
  date: string; // "YYYY-MM-DD"
  start: string; // "HH:MM"
  end: string; // "HH:MM"
};

export function CreateCalendar() {
  const [rows, setRows] = useState<Row[]>([{ date: "", start: "", end: "" }]);

  const addDays = (isoDate: string, n: number): string => {
    if (!isoDate) return "";
    const d = new Date(isoDate + "T00:00:00");
    d.setDate(d.getDate() + n);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleChange = (index: number, key: keyof Row, value: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const handleAdd = () => {
    setRows((prev) => {
      const last = prev[prev.length - 1] || { date: "", start: "", end: "" };
      const nextRow: Row = {
        date: addDays(last.date, 1),
        start: last.start,
        end: last.end,
      };
      return [...prev, nextRow];
    });
  };

  const handleDelete = (index: number) => {
    setRows((prev) => {
      // 行が1件しかなければ削除せず、そのまま返す
      if (prev.length <= 1) {
        return prev;
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const isTimeOrderValid = (start: string, end: string) => {
    if (!start || !end) return false;
    const toMinutes = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    return toMinutes(end) > toMinutes(start);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const emptyIdx = rows.findIndex((r) => !r.date || !r.start || !r.end);
    if (emptyIdx !== -1) {
      alert(
        `未入力があります（${emptyIdx + 1}行目）。日付・開始・終了を埋めてください。`,
      );
      return;
    }
    const invalidTimeIdx = rows.findIndex(
      (r) => !isTimeOrderValid(r.start, r.end),
    );
    if (invalidTimeIdx !== -1) {
      alert(`終了は開始より後にしてください（${invalidTimeIdx + 1}行目）。`);
      return;
    }
    const summary = rows
      .map((r, i) => `${i + 1}. ${r.date} ${r.start} - ${r.end}`)
      .join("\n");
    alert(`保存しました：\n${summary}`);
  };

  return (
    <div className="cc-root">
      <div className="cc-header">
        <div className="cc-headerInner">
          <h2 className="cc-title">カレンダー新規作成</h2>

          <div className="cc-actions">
            <button
              type="button"
              onClick={handleAdd}
              className="cc-btn cc-btnGhost"
            >
              追加
            </button>
            <button type="submit" className="cc-btn cc-btnPrimary">
              保存
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="cc-form">
        {/* 入力カード群は下に */}
        <div className="cc-rows">
          {rows.map((row, idx) => (
            <div key={idx} className="cc-rowCard">
              <div className="cc-rowGrid">
                <div className="cc-field">
                  <div className="cc-label">日付</div>
                  <input
                    className="cc-input"
                    type="date"
                    value={row.date}
                    onChange={(e) => handleChange(idx, "date", e.target.value)}
                  />
                </div>

                <div className="cc-field">
                  <div className="cc-label">開始時刻</div>
                  <input
                    className="cc-input"
                    type="time"
                    step={900}
                    value={row.start}
                    onChange={(e) => handleChange(idx, "start", e.target.value)}
                  />
                </div>

                <div className="cc-field">
                  <div className="cc-label">終了時刻</div>
                  <input
                    className="cc-input"
                    type="time"
                    step={900}
                    value={row.end}
                    onChange={(e) => handleChange(idx, "end", e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  aria-label="行を削除"
                  className="cc-deleteBtn"
                  onClick={() => handleDelete(idx)}
                />
              </div>
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}
