export type HeaderProps = {
  title: string;
  onClickTitle?: () => void;
};

export type HomeProps = {
  goCreate: () => void;
  goUpdate: () => void;
  onOpenUrl?: (url: string) => void;
};

export type MainViewProps = {
  mode: MainViewMode | null;
  onRequestCreate: () => void;
  onRequestUpdate: () => void;
};
