import { useEffect, useState } from "react";

export default function ClaimForm({
  initial,
  machines,
  submitting,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState({
    machine_id: "",
    failure_date: "",
    operating_hours: "",
    failure_node: "",
    failure_description: "",
    recovery_method: "",
    used_spare: "",
    restored_date: "",
    downtime_hours: "",
  });

  useEffect(() => {
    if (initial) {
      setForm({
        machine: initial.machine || initial.machine_id || "",
        failure_date: initial.failure_date || "",
        operating_hours: initial.operating_hours ?? "",
        failure_node: initial.failure_node || "",
        failure_description: initial.failure_description || "",
        recovery_method: initial.recovery_method || "",
        used_spare: initial.used_spare || "",
        restored_date: initial.restored_date || "",
        downtime_hours: initial.downtime_hours ?? "",
      });
    }
  }, [initial]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="form-vert"
    >
      <label>
        Машина*
        <select
          name="machine"
          value={form.machine}
          onChange={onChange}
          required
        >
          <option value="">— выберите —</option>
          {machines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.serial_number} — {m.model_name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Дата отказа*
        <input
          type="date"
          name="failure_date"
          value={form.failure_date}
          onChange={onChange}
          required
        />
      </label>

      <label>
        Наработка, м/ч
        <input
          type="number"
          name="operating_hours"
          value={form.operating_hours}
          onChange={onChange}
          min="0"
        />
      </label>

      <label>
        Узел отказа*
        <input
          type="text"
          name="failure_node"
          value={form.failure_node}
          onChange={onChange}
          required
        />
      </label>

      <label>
        Описание отказа
        <textarea
          name="failure_description"
          value={form.failure_description}
          onChange={onChange}
          rows={3}
        />
      </label>

      <label>
        Способ восстановления
        <textarea
          name="recovery_method"
          value={form.recovery_method}
          onChange={onChange}
          rows={2}
        />
      </label>

      <label>
        Использованные запчасти
        <textarea
          name="used_spare"
          value={form.used_spare}
          onChange={onChange}
          rows={2}
        />
      </label>

      <label>
        Дата восстановления
        <input
          type="date"
          name="restored_date"
          value={form.restored_date}
          onChange={onChange}
        />
      </label>

      <label>
        Простой (ч)
        <input
          type="number"
          name="downtime_hours"
          value={form.downtime_hours}
          onChange={onChange}
          min="0"
        />
      </label>

      <div className="form-actions">
        <button type="button" onClick={onCancel}>Отмена</button>
        <button type="submit" disabled={submitting}>
          {submitting ? "Сохранение…" : "Сохранить"}
        </button>
      </div>
    </form>
  );
}
