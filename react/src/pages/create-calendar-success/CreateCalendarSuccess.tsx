import type { CreateCalendarSuccessProps } from "../../types/pages";
import { useCreateCalendarSuccess } from "./useCreateCalendarSuccess";

export function CreateCalendarSuccess({
  createdCalendarUrl,
  onUpdateAvailability,
}: CreateCalendarSuccessProps) {
  const { copied, handleCopy } = useCreateCalendarSuccess(createdCalendarUrl);

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
