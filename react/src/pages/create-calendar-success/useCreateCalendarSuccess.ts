import { useState } from "react";
import type { CreateCalendarSuccessProps } from "../../types/pages";

export function useCreateCalendarSuccess({
  createdCalendarUrl,
  onOpenUrl,
}: CreateCalendarSuccessProps) {
  const [copied, setCopied] = useState(false);

  const handleOpen = () => {
    if (onOpenUrl) {
      onOpenUrl(createdCalendarUrl);
    }
  };

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

  return { copied, handleCopy, handleOpen };
}
