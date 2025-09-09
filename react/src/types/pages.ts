import type { MainViewMode } from "./pagesUnion";

export type HeaderProps = {
    readonly title: string;
    readonly onClickTitle?: () => void;
  };
  
  export type HomeProps = {
    readonly goCreate: () => void;
    readonly goUpdate: () => void;
    readonly onOpenUrl?: (url: string) => void;
  };
    
  export type MainViewProps = {
    readonly mode: MainViewMode | null;
    readonly onRequestCreate: () => void;
    readonly onRequestUpdate: () => void;
  };
  