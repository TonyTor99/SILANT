import { useEffect, useMemo, useState } from "react";

export default function MaintenanceForm({
  initial,            // объект из строки таблицы, может НЕ иметь id машины
  machines,           // [{id, serial_number, model_name}, ...]
  types,              // [{value:id, label:name}, ...]
  submitting = false,
  onCancel,
  onSubmit,           // (payload) => Promise
}) {
  // вычислим начальные значения
  const initialMachineId = useMemo(() => {
    if (!initial) return "";
    // в таблице ТО у тебя было поле machine_serial — найдём по нему id
    const bySerial = machines.find(m => m.serial_number === initial.machine_serial);
    if (bySerial) return bySerial.id;
    // если вдруг initial уже содержит machine (id) — используем его
    if (typeof initial.machine === "number") return initial.machine;
    return "";
  }, [initial, machines]);

  const initialTypeId = useMemo(() => {
    if (!initial) return "";
    // в таблице у тебя либо объект {id, name}, либо просто id
    if (initial.maintenance_type && typeof initial.maintenance_type === "object") {
      return initial.maintenance_type.id;
    }
    if (typeof initial.maintenance_type === "number") {
      return initial.maintenance_type;
    }
    return "";
  }, [initial]);

  const [form, setForm] = useState({
    machine_id: initialMachineId,
    maintenance_type: initialTypeId,
    date: initial?.date || "",
    operating_hours: initial?.operating_hours ?? "",
    order_number: initial?.order_number || "",
    order_date: initial?.order_date || "",
    service_company: initial?.service_company || "",
  });

  useEffect(() => {
    setForm(f => ({
      ...f,
      machine_id: initialMachineId,
      maintenance_type: initialTypeId,
      date: initial?.date || "",
      operating_hours: initial?.operating_hours ?? "",
      order_number: initial?.order_number || "",
      order_date: initial?.order_date || "",
      service_company: initial?.service_company || "",
    }));
  }, [initialMachineId, initialTypeId, initial]);

  function update(k, v) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.machine) {
      alert("Выберите машину");
      return;
    }
    if (!form.maintenance_type) {
      alert("Выберите вид ТО");
      return;
    }

    // приводим типы
    const payload = {
      machine_id: Number(form.machine),
      maintenance_type: Number(form.maintenance_type),
      date: form.date || null,
      operating_hours:
        form.operating_hours === "" ? null : Number(form.operating_hours),
      order_number: form.order_number || "",
      order_date: form.order_date || null,
      service_company: form.service_company || "", // может заполниться на бэке
    };

    await onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <label>
        Машина*
        <select
          value={form.machine}
          onChange={(e) => update("machine", e.target.value)}
          required
        >
          <option value="">— выберите —</option>
          {machines.map(m => (
            <option key={m.id} value={m.id}>
              {m.serial_number} — {m.model_name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Вид ТО*
        <select
          value={form.maintenance_type}
          onChange={(e) => update("maintenance_type", e.target.value)}
          required
        >
          <option value="">— выберите —</option>
          {types.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </label>

      <label>
        Дата
        <input
          type="date"
          value={form.date}
          onChange={(e) => update("date", e.target.value)}
        />
      </label>

      <label>
        Наработка, м/ч
        <input
          type="number"
          inputMode="numeric"
          value={form.operating_hours}
          onChange={(e) => update("operating_hours", e.target.value)}
        />
      </label>

      <label>
        № заказ-наряда
        <input
          type="text"
          value={form.order_number}
          onChange={(e) => update("order_number", e.target.value)}
        />
      </label>

      <label>
        Дата заказ-наряда
        <input
          type="date"
          value={form.order_date}
          onChange={(e) => update("order_date", e.target.value)}
        />
      </label>

      <label>
        Организация, проводившая ТО
        <input
          type="text"
          value={form.service_company}
          onChange={(e) => update("service_company", e.target.value)}
        />
      </label>

      <div className="form-actions">
        <button type="button" onClick={onCancel} disabled={submitting}>
          Отмена
        </button>
        <button type="submit" disabled={submitting}>
          Сохранить
        </button>
      </div>
    </form>
  );
}
