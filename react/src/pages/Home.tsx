import { useState } from "react";
import type { HomeProps } from "../types/pages";

export function Home({ goCreate, goUpdate, onOpenUrl }: HomeProps) {
  const [url, setUrl] = useState("");

  const handleOpen = () => {
    if (onOpenUrl) {
      onOpenUrl(url);
    } else {
      goUpdate();
    }
  };

  return (
    <div className="home">
      <input
        className="input home__input"
        type="text"
        placeholder="共有されたURLを貼り付け"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <div className="home__actions">
        <button className="home__btn btn btn--primary" onClick={handleOpen}>
          もらったURLを開く
        </button>

        <button className="home__btn btn btn--ghost" onClick={goCreate}>
          自分でカレンダーを作成する
        </button>
      </div>
    </div>
  );
}
