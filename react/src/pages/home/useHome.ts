import { useState } from "react";

export function useHome(onOpenUrl?: (url: string) => void) {
  const [url, setUrl] = useState("");

  const handleOpen = () => {
    if (onOpenUrl) {
      onOpenUrl(url);
    }
  };

  return {
    url,
    setUrl,
    handleOpen,
  };
}
