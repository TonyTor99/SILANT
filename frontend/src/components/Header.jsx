import { useEffect, useState } from "react";
import "../styles/Header.scss";
import Login from "./Login";
import { getMe, setToken, getToken } from "../api";

export default function Header({ onLogin, onLogout }) {
  const [me, setMe] = useState(null);

  useEffect(() => {
    if (!getToken()) return;
    getMe()
      .then((u) => {
        setMe(u);
        onLogin?.(u);
      })
      .catch(() => setMe(null));
  }, []);

  function logout() {
    setToken("");
    setMe(null);
    onLogout?.();
  }

  return (
    <header>
      <div className="logo-container">
        <img className="logo" src="/src/assets/logo-grey.svg" alt="Логотип" />
      </div>
      <h1>Электронная сервисная книжка "Мой Силант"</h1>

      <div className="right-side">
        <div className="contacts">
          <a className="phone" href="tel:+78002003000">
            8-800-200-30-00
          </a>
          <a
            href="https://t.me/example"
            target="_blank"
            rel="noopener noreferrer"
            className="telegram-link"
          >
            <img src="/src/assets/telegram-logo.svg" alt="Telegram" />
          </a>
        </div>
        <nav>
          {me ? (
            <div className="userbox">
              <span className="nick">Здравствуйте, {me.username}</span>
              <button onClick={logout} className="logout">
                Выйти
              </button>
            </div>
          ) : (
            <Login
              onLoggedIn={(u) => {
                setMe(u);
                onLogin?.(u);
              }}
            />
          )}
        </nav>
      </div>
    </header>
  );
}
