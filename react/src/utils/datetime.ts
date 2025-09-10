/**
 * 指定した日付文字列 (YYYY-MM-DD) に n 日を加算した新しい日付文字列を返す関数
 */
export const addDays = (isoDate: string, n: number): string => {
  if (!isoDate) return "";
  const d = new Date(isoDate + "T00:00:00");
  d.setDate(d.getDate() + n);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * "HH:MM" 形式の時刻文字列を分単位の数値に変換する関数
 * 例: "01:30" → 90, "24:00" → 1440
 */
export const toMinutes = (t: string): number => {
  const [hStr, mStr] = t.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (h === 24 && m === 0) return 24 * 60; // 24:00 の場合
  return h * 60 + m;
};

/**
 * 開始時刻より終了時刻が後かどうかを判定する関数
 */
export const isTimeOrderValid = (start: string, end: string): boolean => {
  if (!start || !end) return false;
  return toMinutes(end) > toMinutes(start);
};

/**
 * 日付 (YYYY-MM-DD) と時刻 (HH:MM) を結合して
 * "YYYY-MM-DD HH:MM:SS" 形式に変換する関数
 */
export const toDateTimeString = (date: string, time: string): string => {
  const withSeconds = time.length === 5 ? `${time}:00` : time; // 秒がなければ付与
  return `${date} ${withSeconds}`;
};
