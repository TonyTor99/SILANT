import { useState } from "react";
import { login, getMe } from "../api";
import "../styles/Login.scss";

export default function Login({ onLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login(username, password);
      const me = await getMe();
      onLoggedIn?.(me);
    } catch (e) {
      setErr(e.message || "Ошибка входа");
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display:"flex", gap:8, alignItems:"center" }}>
      <input
        value={username} onChange={(e)=>setUsername(e.target.value)}
        placeholder="Логин" />
      <input
        type="password"
        value={password} onChange={(e)=>setPassword(e.target.value)}
        placeholder="Пароль" />
      <button type="submit">Войти</button>
      {err && <span style={{ color:"#D20A11" }}>{err}</span>}
    </form>
  );
}
