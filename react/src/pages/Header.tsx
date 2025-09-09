type HeaderProps = {
    title: string;
    onClickTitle?: () => void;
  };
  
  export function Header({ title, onClickTitle }: HeaderProps) {
    const clickable = Boolean(onClickTitle);
  
    return (
      <header className="header">
        <div className="header__inner">
          <h1
            className={`header__title${clickable ? " header__title--clickable" : ""}`}
            onClick={onClickTitle}
          >
            {title}
          </h1>
        </div>
      </header>
    );
  }
  