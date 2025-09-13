import { useEffect, useState } from "react";

export default function MachineForm({
  initial,        // объект машины или null
  submitting = false,
  onSubmit,       // (payload) => Promise
  onCancel,
}) {
  const [f, setF] = useState({
    model_name: "",
    serial_number: "",
    engine_model: "",
    engine_serial: "",
    transmission_model: "",
    transmission_serial: "",
    drive_axle_model: "",
    drive_axle_serial: "",
    steer_axle_model: "",
    steer_axle_serial: "",
    shipment_date: "",
    buyer: "",
    recipient: "",
    delivery_address: "",
    options: "",
    service_company: "",
  });

  useEffect(() => {
    if (initial) {
      setF({
        model_name: initial.model_name || "",
        serial_number: initial.serial_number || "",
        engine_model: initial.engine_model || "",
        engine_serial: initial.engine_serial || "",
        transmission_model: initial.transmission_model || "",
        transmission_serial: initial.transmission_serial || "",
        drive_axle_model: initial.drive_axle_model || "",
        drive_axle_serial: initial.drive_axle_serial || "",
        steer_axle_model: initial.steer_axle_model || "",
        steer_axle_serial: initial.steer_axle_serial || "",
        shipment_date: initial.shipment_date || "",
        buyer: initial.buyer || "",
        recipient: initial.recipient || "",
        delivery_address: initial.delivery_address || "",
        options: initial.options || "",
        service_company: initial.service_company || "",
      });
    }
  }, [initial]);

  function up(k, v) { setF(prev => ({ ...prev, [k]: v })); }

  function onSubmitForm(e) {
    e.preventDefault();
    // серийник у тебя CharField — не стираем ведущие нули!
    onSubmit(f);
  }

  return (
    <form onSubmit={onSubmitForm} className="form-vert">
      <div className="grid-two">
        <label>
          Модель техники*
          <input value={f.model_name} onChange={e=>up("model_name", e.target.value)} required />
        </label>
        <label>
          Зав. № машины* (только цифры)
          <input
            value={f.serial_number}
            onChange={e=>up("serial_number", e.target.value)}
            pattern="[0-9]+"
            required
          />
        </label>

        <label>
          Модель двигателя
          <input value={f.engine_model} onChange={e=>up("engine_model", e.target.value)} />
        </label>
        <label>
          Зав. № двигателя
          <input value={f.engine_serial} onChange={e=>up("engine_serial", e.target.value)} />
        </label>

        <label>
          Модель трансмиссии
          <input value={f.transmission_model} onChange={e=>up("transmission_model", e.target.value)} />
        </label>
        <label>
          Зав. № трансмиссии
          <input value={f.transmission_serial} onChange={e=>up("transmission_serial", e.target.value)} />
        </label>

        <label>
          Модель ведущего моста
          <input value={f.drive_axle_model} onChange={e=>up("drive_axle_model", e.target.value)} />
        </label>
        <label>
          Зав. № ведущего моста
          <input value={f.drive_axle_serial} onChange={e=>up("drive_axle_serial", e.target.value)} />
        </label>

        <label>
          Модель управляемого моста
          <input value={f.steer_axle_model} onChange={e=>up("steer_axle_model", e.target.value)} />
        </label>
        <label>
          Зав. № управляемого моста
          <input value={f.steer_axle_serial} onChange={e=>up("steer_axle_serial", e.target.value)} />
        </label>

        <label>
          Дата отгрузки
          <input type="date" value={f.shipment_date} onChange={e=>up("shipment_date", e.target.value)} />
        </label>
        <label>
          Сервисная компания
          <input value={f.service_company} onChange={e=>up("service_company", e.target.value)} />
        </label>

        <label>
          Покупатель
          <input value={f.buyer} onChange={e=>up("buyer", e.target.value)} />
        </label>
        <label>
          Грузополучатель
          <input value={f.recipient} onChange={e=>up("recipient", e.target.value)} />
        </label>

        <label className="col-span-2">
          Адрес поставки
          <input value={f.delivery_address} onChange={e=>up("delivery_address", e.target.value)} />
        </label>

        <label className="col-span-2">
          Комплектация (доп. опции)
          <textarea rows={3} value={f.options} onChange={e=>up("options", e.target.value)} />
        </label>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel}>Отмена</button>
        <button type="submit" disabled={submitting}>{submitting ? "Сохранение…" : "Сохранить"}</button>
      </div>
    </form>
  );
}
