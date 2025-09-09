export type HeaderProps = {
  title: string;
  onClickTitle?: () => void;
};

export type HomeProps = {
  goCreate: () => void;
  goUpdate: () => void;
  onOpenUrl?: (url: string) => void;
};
