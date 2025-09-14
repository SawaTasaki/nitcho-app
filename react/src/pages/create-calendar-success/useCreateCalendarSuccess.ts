import { useState } from "react";

export function useCreateCalendarSuccess(createdCalendarUrl: string) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(createdCalendarUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
      alert("コピーに失敗しました");
    }
  };

  return { copied, handleCopy };
}
