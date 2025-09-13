import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { authFetch } from "../api";
import "../styles/MachinePage.scss";

export default function MachinePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    authFetch(`/api/machines/${id}/`)
      .then((r) => (r.ok ? r.json() : Promise.reject("Не удалось загрузить")))
      .then((d) => {
        if (alive) setData(d);
      })
      .catch((e) => {
        if (alive) setErr(String(e));
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading)
    return (
      <main className="machine">
        <p>Загрузка…</p>
      </main>
    );
  if (err)
    return (
      <main className="machine">
        <p className="err">{err}</p>
      </main>
    );
  if (!data) return null;

  return (
    <main className="machine">
      <div className="machine__head">
        <div>
          <h2>
            {data.model_name} — {data.serial_number}
          </h2>
          <div className="muted">
            Сервисная компания: {data.service_company || "—"}
          </div>
        </div>
        <Link to="/" className="btn-back">
          Назад
        </Link>
      </div>

      {/* ТТХ */}
      <section className="card">
        <h3>Комплектация и технические характеристики</h3>
        <div className="specs">
          <div>
            <label>Модель двигателя</label>
            <span>{data.engine_model || "—"}</span>
          </div>
          <div>
            <label>№ двигателя</label>
            <span>{data.engine_serial || "—"}</span>
          </div>

          <div>
            <label>Модель трансмиссии</label>
            <span>{data.transmission_model || "—"}</span>
          </div>
          <div>
            <label>№ трансмиссии</label>
            <span>{data.transmission_serial || "—"}</span>
          </div>

          <div>
            <label>Модель ведущего моста</label>
            <span>{data.drive_axle_model || "—"}</span>
          </div>
          <div>
            <label>№ ведущего моста</label>
            <span>{data.drive_axle_serial || "—"}</span>
          </div>

          <div>
            <label>Модель управляемого моста</label>
            <span>{data.steer_axle_model || "—"}</span>
          </div>
          <div>
            <label>№ управляемого моста</label>
            <span>{data.steer_axle_serial || "—"}</span>
          </div>

          <div>
            <label>Дата отгрузки</label>
            <span>{data.shipment_date || "—"}</span>
          </div>
          <div>
            <label>Покупатель</label>
            <span>{data.buyer || "—"}</span>
          </div>
          <div>
            <label>Грузополучатель</label>
            <span>{data.recipient || "—"}</span>
          </div>
          <div>
            <label>Адрес поставки</label>
            <span>{data.delivery_address || "—"}</span>
          </div>
        </div>

        {data.options && (
          <>
            <h4>Доп. опции</h4>
            <div className="pre">{data.options}</div>
          </>
        )}
      </section>

      {/* ТО (полный список только по этой машине) */}
      <section className="card">
        <h3>ТО — история обслуживания</h3>
        <table className="tbl">
          <thead>
            <tr>
              <th>Вид ТО</th>
              <th>Дата</th>
              <th>Наработка</th>
              <th>№ з/н</th>
              <th>Дата з/н</th>
              <th>Организация</th>
            </tr>
          </thead>
          <tbody>
            {data.maintenance.map((x) => (
              <tr key={x.id}>
                <td>{x.maintenance_type?.name ?? x.maintenance_type}</td>
                <td>{x.date}</td>
                <td>{x.operating_hours}</td>
                <td>{x.order_number}</td>
                <td>{x.order_date}</td>
                <td>{x.service_company}</td>
              </tr>
            ))}
            {data.maintenance.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
                  Нет записей
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Рекламации */}
      <section className="card">
        <h3>Рекламации</h3>
        <table className="tbl">
          <thead>
            <tr>
              <th>Дата отказа</th>
              <th>Наработка</th>
              <th>Узел</th>
              <th>Описание</th>
              <th>Восстановление</th>
              <th>Запчасти</th>
              <th>Дата восстановления</th>
              <th>Простой (ч)</th>
            </tr>
          </thead>
          <tbody>
            {data.claims.map((c) => (
              <tr key={c.id}>
                <td>{c.failure_date}</td>
                <td>{c.operating_hours}</td>
                <td>{c.failure_node}</td>
                <td>{c.failure_description}</td>
                <td>{c.recovery_method}</td>
                <td>{c.used_spare}</td>
                <td>{c.restored_date}</td>
                <td>{c.downtime_hours}</td>
              </tr>
            ))}
            {data.claims.length === 0 && (
              <tr>
                <td colSpan={8} className="muted">
                  Нет записей
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
