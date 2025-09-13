import "../styles/Footer.scss";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <a className="footer__btn" href="tel:+78002003000">
          +7-800-200-30-00
        </a>

        <div className="footer__spacer" />

        <a
          className="footer__btn footer__tg"
          href="https://t.me/silant_support"
          target="_blank"
          rel="noreferrer"
          aria-label="Telegram"
          title="Написать в Telegram"
        >
          <img src="/src/assets/telegram-logo.svg" alt="" />
        </a>

        <span className="footer__badge">Мой Силант {year}</span>
      </div>
    </footer>
  );
}
