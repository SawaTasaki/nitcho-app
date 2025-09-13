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

/**
 * "YYYY-MM-DD HH:MM:SS" を Date に変換
 * 例: "2025-07-14 10:00:00" → Date
 */
export const toDate = (s: string): Date => {
  return new Date(s.replace(" ", "T"));
};

/**
 * Date を "YYYY/MM/DD" 形式に変換
 */
export const formatDate = (d: Date): string => {
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

/**
 * Date を "HH:MM" 形式に変換
 */
export const formatHour = (d: Date): string => {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/**
 * Date を "YYYY-MM-DDTHH:MM:SS" (ローカル時刻基準) に変換
 */
export const toLocalISOString = (dt: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(
    dt.getHours()
  )}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
};

/**
 * 指定した区間を 15 分刻みで配列に展開
 * 例: "2025-07-12T00:00:00"〜"2025-07-12T01:00:00"
 * → ["2025-07-12T00:00:00", "2025-07-12T00:15:00", ... , "2025-07-12T01:00:00"]
 */
export const eachQuarterWithEnd = (start: Date, end: Date): Date[] => {
  const times: Date[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    times.push(new Date(cur));
    cur.setMinutes(cur.getMinutes() + 15);
  }
  return times;
};
