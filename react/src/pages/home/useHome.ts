import { useState } from "react";
import type { HomeProps } from "../../types/pages";

export function useHome(onOpenUrl: HomeProps["onOpenUrl"]) {
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
