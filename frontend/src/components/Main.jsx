import { useState } from "react";
import "../styles/Main.scss";

export default function Main() {
  const [serial, setSerial] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [nonResults, setNonResults] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!serial.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);
    setNonResults(false);

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/search?q=${serial}`);
      if (!res.ok) throw new Error(`Ошибка ${res.status}`);
      const data = await res.json();

      // API /api/search возвращает массив
      const items = Array.isArray(data) ? data : data.results || [];
      setResults(items);
      setNonResults(items.length === 0);
    } catch (err) {
      setError(err.message);
      setNonResults(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="main">
      <div className="container">
        <h1 className="title">
          Проверьте комплектацию и технические характеристики техники Силант
        </h1>

        {/* Форма */}
        <form className="single-search" onSubmit={onSubmit}>
          <div className="input-wrap">
            <img className="input-icon" src="src/assets/search.svg" alt="" />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Введите заводской номер машины"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
            />
          </div>
          <button className="btn-primary" type="submit">
            Поиск
          </button>
        </form>

        {/* Состояния */}
        {loading && <p>Загрузка...</p>}
        {error && <p className="error">{error}</p>}

        {/* Таблица */}
        {results.length > 0 && (
          <div className="table-wrap">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Зав. № машины</th>
                  <th>Модель техники</th>
                  <th>Модель двигателя</th>
                  <th>Зав. № двигателя</th>
                  <th>Модель трансмиссии</th>
                  <th>Зав. № трансмиссии</th>
                  <th>Модель ведущего моста</th>
                  <th>Зав. № ведущего моста</th>
                  <th>Модель управляемого моста</th>
                  <th>Зав. № управляемого моста</th>
                </tr>
              </thead>
              <tbody>
                {results.map((m) => (
                  <tr key={m.id}>
                    <td data-label="Зав. № машины">{m.serial_number}</td>
                    <td data-label="Модель техники">{m.model_name}</td>
                    <td data-label="Модель двигателя">{m.engine_model}</td>
                    <td data-label="Зав. № двигателя">{m.engine_serial}</td>
                    <td data-label="Модель трансмиссии">
                      {m.transmission_model}
                    </td>
                    <td data-label="Зав. № трансмиссии">
                      {m.transmission_serial}
                    </td>
                    <td data-label="Модель ведущего моста">
                      {m.drive_axle_model}
                    </td>
                    <td data-label="Зав. № ведущего моста">
                      {m.drive_axle_serial}
                    </td>
                    <td data-label="Модель управляемого моста">
                      {m.steer_axle_model}
                    </td>
                    <td data-label="Зав. № управляемого моста">
                      {m.steer_axle_serial}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && nonResults && (
          <p>Машины с таким номером не найдено</p>
        )}
      </div>
    </main>
  );
}
