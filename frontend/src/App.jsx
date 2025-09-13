import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import Main from "./components/Main";
import Dashboard from "./components/Dashboard";
import MachinePage from "./components/MachinePage";
import Footer from "./components/Footer";
import { getToken } from "./api";

export default function App() {
  const [authed, setAuthed] = useState(!!getToken());

  useEffect(() => {
    const onStorage = () => setAuthed(!!getToken());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function handleLogin() {
    setAuthed(true);
  }
  function handleLogout() {
    setAuthed(false);
  }

  return (
    <div className="app">
      <BrowserRouter>
        <Header onLogin={handleLogin} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={authed ? <Dashboard /> : <Main />} />
          <Route
            path="/machines/:id"
            element={authed ? <MachinePage /> : <Navigate to="/" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}
