import { useState } from "react";
import type { Row, TimeslotPayload } from "../../types/pages";
import { addDays, isTimeOrderValid, toDateTimeString } from "@/utils/datetime";

export const useCreateCalendar = () => {
  const [rows, setRows] = useState<Row[]>([{ date: "", start: "", end: "" }]);
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 指定した行のフィールド値を更新する関数
  const handleChange = (index: number, key: keyof Row, value: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  // 最終行の日付の翌日を自動入力した新しい行を追加する関数
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

  // 指定した行を削除する関数（最低1行は必ず残す）
  const handleDelete = (index: number) => {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  // バックエンドに schedule を送信する非同期関数
  const submitToBackend = async (title: string, timeslots: TimeslotPayload[]) => {
    const payload = { title, timeslots };
  
    const endpoint = `${import.meta.env.VITE_BACKEND_ORIGIN}/schedules`; 
    console.log("POST payload:", payload);
  
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to save (HTTP ${res.status}): ${text}`);
    }
  
    return res.json();
  };  

  // 入力行を検証・整形してバックエンド送信し、結果をユーザーに通知する関数
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // タイトル必須チェック
    if (!title.trim()) {
      alert("タイトルを入力してください。");
      return;
    }
  
    // 1) 入力済み行のみ抽出
    const filled = rows.filter((r) => r.date && r.start && r.end);
  
    // 2) 時間が逆の行は無視
    const valid = filled.filter((r) => isTimeOrderValid(r.start, r.end));
    const ignoredCount = filled.length - valid.length;
  
    // 3) ペイロード生成
    const timeslots: TimeslotPayload[] = valid.map((r) => ({
      start_time: toDateTimeString(r.date, r.start),
      end_time: toDateTimeString(r.date, r.end),
    }));
  
    if (timeslots.length === 0) {
      alert("有効な行がありません。");
      return;
    }
  
    try {
      setIsSubmitting(true);
      const saved = await submitToBackend(title, timeslots);
  
      // 保存成功後のメッセージ
      const summary = saved.timeslots
        .map(
          (t: any, i: number) => `${i + 1}. ${t.start_time} - ${t.end_time}`
        )
        .join("\n");
  
      const ignoredMsg =
        ignoredCount > 0
          ? `\n（時間が逆の行は ${ignoredCount} 件スキップしました）`
          : "";
  
      alert(`保存しました：${saved.title}\n${summary}${ignoredMsg}`);
    } catch (err: unknown) {
      console.error(err);
      alert(`保存に失敗しました：${(err as Error)?.message ?? String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };  

  return {
    rows,
    isSubmitting,
    handleChange,
    handleAdd,
    handleDelete,
    handleSave,
    title,
    setTitle,
  };
};
