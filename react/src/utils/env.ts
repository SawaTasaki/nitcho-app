// env.js で注入されるキーを型として定義
interface WindowEnv {
  VITE_BACKEND_ORIGIN?: string;
}

// window に ENV を追加する型を宣言
declare global {
  interface Window {
    ENV?: WindowEnv;
  }
}

export const getEnv = (key: keyof WindowEnv, fallback?: string): string => {
  return window.ENV?.[key] ?? fallback ?? "";
};
