import { useState } from "react";
import type { CreateCalendarSuccessProps } from "../types/pages";

export function CreateCalendarSuccess({
  createdCalendarUrl,
  onUpdateAvailability,
}: CreateCalendarSuccessProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(createdCalendarUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // 2秒後にリセット
    } catch (err) {
      console.log(err);
      alert("コピーに失敗しました");
    }
  };

  return (
    <div className="create-calendar-success">
      <h2 className="create-calendar-success__title">
        新規カレンダーを作成しました！
      </h2>

      <p className="create-calendar-success__url">{createdCalendarUrl}</p>

      <div className="create-calendar-success__actions">
        <button className="btn btn--primary" onClick={handleCopy}>
          {copied ? "コピーしました！" : "カレンダーをコピーしてシェアする"}
        </button>
        <button className="btn btn--ghost" onClick={onUpdateAvailability}>
          カレンダーに予定を入れる
        </button>
      </div>
    </div>
  );
}
