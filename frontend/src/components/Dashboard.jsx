import { useEffect, useState } from "react";
import {
  authFetch,
  getMe,
  resolveRole,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  createClaim,
  updateClaim,
  deleteClaim,
  createMachine,
  updateMachine,
  deleteMachine,
  getMachine,
} from "../api";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "../components/Modal";
import MaintenanceForm from "../components/MaintenanceForm";
import FilterBar from "../components/FilterBar";
import ClaimForm from "../components/ClaimForm";
import MachineForm from "../components/MachineForm";
import "../styles/Dashboard.scss";

function TabButton({ active, onClick, children }) {
  return (
    <button className={`tab-btn ${active ? "active" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

export default function Dashboard({ user }) {
  const [me, setMe] = useState(user);
  const [role, setRole] = useState("unknown");
  const canEditMaint =
    role === "manager" || role === "service" || role === "client";
  const canEditClaims = role === "manager" || role === "service";
  const canEditMachines = role === "manager";
  const [tab, setTab] = useState("machines");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);

  const [facetsMachines, setFacetsMachines] = useState(null);
  const [facetsMaint, setFacetsMaint] = useState(null);
  const [facetsClaims, setFacetsClaims] = useState(null);

  const [openMaint, setOpenMaint] = useState(false);
  const [editingMaint, setEditingMaint] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [machinesForSelect, setMachinesForSelect] = useState([]);
  const [maintTypesForSelect, setMaintTypesForSelect] = useState([]);

  const [openMachine, setOpenMachine] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [machineSubmitting, setMachineSubmitting] = useState(false);
  const [machineLoading, setMachineLoading] = useState(false);

  const [openClaim, setOpenClaim] = useState(false);
  const [editingClaim, setEditingClaim] = useState(null);
  const [claimSubmitting, setClaimSubmitting] = useState(false);

  const navigate = useNavigate();
  const query = useQuery();

  useEffect(() => {
    if (tab === "machines") {
      authFetch("/api/machines/facets/")
        .then((r) => r.json())
        .then(setFacetsMachines)
        .catch(() => setFacetsMachines(null));
    } else if (tab === "maintenance") {
      authFetch("/api/maintenance/facets/")
        .then((r) => r.json())
        .then(setFacetsMaint)
        .catch(() => setFacetsMaint(null));
    } else if (tab === "claims") {
      authFetch("/api/claims/facets/")
        .then((r) => r.json())
        .then(setFacetsClaims)
        .catch(() => setFacetsClaims(null));
    }
  }, [tab]);

  useEffect(() => {
    if (tab !== "maintenance") return;

    (async () => {
      try {
        const r1 = await authFetch("/api/machines/?ordering=serial_number");
        const d1 = await r1.json();
        const ms = (Array.isArray(d1) ? d1 : d1.results || []).map((m) => ({
          id: m.id,
          serial_number: m.serial_number,
          model_name: m.model_name,
        }));
        setMachinesForSelect(ms);

        const r2 = await authFetch("/api/maintenance/facets/");
        const d2 = await r2.json();
        const types = (d2.maintenance_type || []).map(([value, label]) => ({
          value,
          label,
        }));
        setMaintTypesForSelect(types);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [tab]);

  useEffect(() => {
    if (tab !== "claims") return;
    (async () => {
      try {
        const r1 = await authFetch("/api/machines/?ordering=serial_number");
        const d1 = await r1.json();
        const ms = (Array.isArray(d1) ? d1 : d1.results || []).map((m) => ({
          id: m.id,
          serial_number: m.serial_number,
          model_name: m.model_name,
        }));
        setMachinesForSelect(ms);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [tab]);

  const machineFilterFields = facetsMachines
    ? [
        {
          name: "model_name",
          label: "Модель техники",
          type: "select",
          options: facetsMachines.model_name,
        },
        {
          name: "engine_model",
          label: "Модель двигателя",
          type: "select",
          options: facetsMachines.engine_model,
        },
        {
          name: "transmission_model",
          label: "Модель трансмиссии",
          type: "select",
          options: facetsMachines.transmission_model,
        },
        {
          name: "steer_axle_model",
          label: "Модель управляемого",
          type: "select",
          options: facetsMachines.steer_axle_model,
        },
        {
          name: "drive_axle_model",
          label: "Модель ведущего",
          type: "select",
          options: facetsMachines.drive_axle_model,
        },
      ]
    : [];

  const maintenanceFilterFields = facetsMaint
    ? [
        {
          name: "maintenance_type",
          label: "Вид ТО",
          type: "select",
          options: facetsMaint.maintenance_type.map(([id, name]) => ({
            value: id,
            label: name,
          })),
        },
        {
          name: "machine__serial_number",
          label: "Зав. № машины",
          type: "select",
          options: facetsMaint.machine_serial,
        },
        {
          name: "service_company",
          label: "Сервисная компания",
          type: "select",
          options: facetsMaint.service_company,
        },
      ]
    : [];

  const claimsFilterFields = facetsClaims
    ? [
        {
          name: "failure_node",
          label: "Узел отказа",
          type: "select",
          options: facetsClaims.failure_node,
        },
        {
          name: "recovery_method",
          label: "Способ восстановления",
          type: "text",
          placeholder: "содержит…",
        },
        {
          name: "machine__serial_number",
          label: "Зав. № машины",
          type: "select",
          options: facetsClaims.machine_serial,
        },
        {
          name: "machine__service_company",
          label: "Сервисная компания",
          type: "select",
          options: facetsClaims.service_company,
        },
      ]
    : [];

  // профиль + роль
  useEffect(() => {
    if (!me) {
      getMe()
        .then((u) => {
          setMe(u);
          setRole(resolveRole(u));
        })
        .catch((e) => setErr(e.message));
    } else {
      setRole(resolveRole(me));
    }
  }, [me]);

  // загрузка данных под вкладку
  useEffect(() => {
    if (!me) return;
    setLoading(true);
    setErr("");

    (async () => {
      try {
        const qs = query.toString();
        let url = "";

        if (tab === "machines") {
          url =
            "/api/machines/?" +
            (qs ? qs + "&" : "") +
            "ordering=-shipment_date";
        } else if (tab === "maintenance") {
          url =
            "/api/maintenance/?" +
            (qs ? qs + "&" : "") +
            "ordering=machine__serial_number,-date";
        } else if (tab === "claims") {
          url =
            "/api/claims/?" +
            (qs ? qs + "&" : "") +
            "ordering=machine__serial_number,-failure_date";
        }

        const r = await authFetch(url);
        const d = await r.json();
        setRows(Array.isArray(d) ? d : d.results || []);
      } catch (e) {
        setErr(String(e.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, [tab, me, query.toString()]);

  return (
    <main className="dash">
      <div className="dash__head">
        <div className="who">
          <div className="who__title">
            {role === "client" && "Клиент"}
            {role === "service" && "Сервисная организация"}
            {role === "manager" && "Менеджер"}
          </div>
          <div className="who__name">{me?.username}</div>
          <div className="who__hint">
            Информация о комплектации и тех. характеристиках вашей техники
          </div>
        </div>

        <div className="tabs">
          <TabButton
            active={tab === "machines"}
            onClick={() => setTab("machines")}
          >
            Общая информация
          </TabButton>
          <TabButton
            active={tab === "maintenance"}
            onClick={() => setTab("maintenance")}
          >
            ТО
          </TabButton>
          <TabButton active={tab === "claims"} onClick={() => setTab("claims")}>
            Рекламации
          </TabButton>
        </div>
      </div>

      {loading && <p>Загрузка…</p>}
      {err && <p className="err">{err}</p>}

      {!loading && !err && tab === "machines" && (
        <>
          {machineLoading && <p>Загружаем данные машины…</p>}
          <Modal
            open={openMachine}
            title={editingMachine ? "Редактировать машину" : "Добавить машину"}
            onClose={() => setOpenMachine(false)}
          >
            <MachineForm
              initial={editingMachine}
              submitting={machineSubmitting}
              onCancel={() => setOpenMachine(false)}
              onSubmit={async (payload) => {
                try {
                  setMachineSubmitting(true);
                  if (editingMachine) {
                    await updateMachine(editingMachine.id, payload);
                  } else {
                    await createMachine(payload);
                  }
                  setOpenMachine(false);
                  setEditingMachine(null);

                  // обновим список
                  const qs = query.toString();
                  const r = await authFetch(
                    "/api/machines/?" +
                      (qs ? qs + "&" : "") +
                      "ordering=-shipment_date"
                  );
                  const d = await r.json();
                  setRows(Array.isArray(d) ? d : d.results || []);
                } catch (e) {
                  alert(e.message || e);
                } finally {
                  setMachineSubmitting(false);
                }
              }}
            />
          </Modal>

          {canEditMachines && (
            <div style={{ marginBottom: 12 }}>
              <button
                onClick={() => {
                  setEditingMachine(null);
                  setOpenMachine(true);
                }}
              >
                + Добавить машину
              </button>
            </div>
          )}
          <FilterBar fields={machineFilterFields} collapsedByDefault />
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Зав. №</th>
                  <th>Модель</th>
                  <th>Двигатель</th>
                  <th>Дата отгрузки</th>
                  <th>Сервисная организация</th>
                  {canEditMachines && <th>Действия</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.id} style={{ cursor: "pointer" }}>
                    <td
                      data-label="Зав. №"
                      onClick={() => navigate(`/machines/${m.id}`)}
                    >
                      {m.serial_number}
                    </td>
                    <td
                      data-label="Модель"
                      onClick={() => navigate(`/machines/${m.id}`)}
                    >
                      {m.model_name}
                    </td>
                    <td
                      data-label="Двигатель"
                      onClick={() => navigate(`/machines/${m.id}`)}
                    >
                      {m.engine_model}
                    </td>
                    <td
                      data-label="Дата отгрузки"
                      onClick={() => navigate(`/machines/${m.id}`)}
                    >
                      {m.shipment_date}
                    </td>
                    <td
                      data-label="Сервисная организация"
                      onClick={() => navigate(`/machines/${m.id}`)}
                    >
                      {m.service_company}
                    </td>
                    {canEditMachines && (
                      <td className="actions" data-label="Действия">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              setMachineLoading(true);
                              const full = await getMachine(m.id);
                              setEditingMachine(full);
                              setOpenMachine(true);
                            } catch (err) {
                              alert(err.message || err);
                            } finally {
                              setMachineLoading(false);
                            }
                          }}
                        >
                          ✎
                        </button>
                        <button
                          onClick={async () => {
                            if (
                              !confirm(
                                "Удалить машину? Это удалит и её ТО/рекламации."
                              )
                            )
                              return;
                            try {
                              await deleteMachine(m.id);
                              const r = await authFetch(
                                "/api/machines/?ordering=-shipment_date"
                              );
                              const d = await r.json();
                              setRows(Array.isArray(d) ? d : d.results || []);
                            } catch (e) {
                              alert(e.message || e);
                            }
                          }}
                        >
                          🗑
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!loading && !err && tab === "maintenance" && (
        <>
          <FilterBar fields={maintenanceFilterFields} collapsedByDefault />
          {canEditMaint && (
            <div style={{ marginBottom: 12 }}>
              <button
                onClick={() => {
                  setEditingMaint(null);
                  setOpenMaint(true);
                }}
              >
                + Добавить ТО
              </button>
            </div>
          )}
          <Modal
            open={openMaint}
            title={editingMaint ? "Редактировать ТО" : "Добавить ТО"}
            onClose={() => setOpenMaint(false)}
          >
            <MaintenanceForm
              initial={editingMaint}
              machines={machinesForSelect}
              types={maintTypesForSelect}
              submitting={submitting}
              onCancel={() => setOpenMaint(false)}
              onSubmit={async (form) => {
                try {
                  setSubmitting(true);
                  if (editingMaint) {
                    // редактирование
                    await updateMaintenance(editingMaint.id, form);
                  } else {
                    // создание
                    await createMaintenance(form);
                  }
                  setOpenMaint(false);
                  setEditingMaint(null);
                  // перезагрузим таблицу ТО
                  const r = await authFetch(
                    "/api/maintenance/?ordering=machine__serial_number,-date"
                  );
                  const d = await r.json();
                  setRows(Array.isArray(d) ? d : d.results || []);
                } catch (e) {
                  alert(e.message || e);
                } finally {
                  setSubmitting(false);
                }
              }}
            />
          </Modal>
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Зав. №</th>
                  <th>Вид ТО</th>
                  <th>Дата</th>
                  <th>Наработка</th>
                  <th>Кем проводилось</th>
                  {canEditMaint && <th>Действия</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((x) => (
                  <tr key={x.id}>
                    <td data-label="Зав. №">{x.machine_serial}</td>
                    <td data-label="Вид ТО">
                      {x.maintenance_type?.name ?? x.maintenance_type}
                    </td>
                    <td data-label="Дата">{x.date}</td>
                    <td data-label="Наработка">{x.operating_hours}</td>
                    <td data-label="Кем проводилось">{x.service_company}</td>
                    {canEditMaint && (
                      <td className="actions" data-label="Действия">
                        <button
                          onClick={() => {
                            setEditingMaint(x);
                            setOpenMaint(true);
                          }}
                        >
                          ✎
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm("Удалить запись ТО?")) return;
                            try {
                              await deleteMaintenance(x.id);
                              const r = await authFetch(
                                "/api/maintenance/?ordering=machine__serial_number,-date"
                              );
                              const d = await r.json();
                              setRows(Array.isArray(d) ? d : d.results || []);
                            } catch (e) {
                              alert(e.message || e);
                            }
                          }}
                        >
                          🗑
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!loading && !err && tab === "claims" && (
        <>
          <Modal
            open={openClaim}
            title={
              editingClaim ? "Редактировать рекламацию" : "Добавить рекламацию"
            }
            onClose={() => setOpenClaim(false)}
          >
            <ClaimForm
              initial={editingClaim}
              machines={machinesForSelect}
              submitting={claimSubmitting}
              onCancel={() => setOpenClaim(false)}
              onSubmit={async (form) => {
                try {
                  setClaimSubmitting(true);
                  if (editingClaim) {
                    await updateClaim(editingClaim.id, form);
                  } else {
                    await createClaim(form);
                  }
                  setOpenClaim(false);
                  setEditingClaim(null);

                  // перезагрузить список
                  const r = await authFetch(
                    "/api/claims/?ordering=machine__serial_number,-failure_date"
                  );
                  const d = await r.json();
                  setRows(Array.isArray(d) ? d : d.results || []);
                } catch (e) {
                  alert(e.message || e);
                } finally {
                  setClaimSubmitting(false);
                }
              }}
            />
          </Modal>
          <FilterBar fields={claimsFilterFields} collapsedByDefault />
          {canEditClaims && (
            <div style={{ marginBottom: 12 }}>
              <button
                onClick={() => {
                  setEditingClaim(null);
                  setOpenClaim(true);
                }}
              >
                + Добавить рекламацию
              </button>
            </div>
          )}
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Зав. №</th>
                  <th>Дата отказа</th>
                  <th>Узел отказа</th>
                  <th>Описание</th>
                  <th>Восстановлено</th>
                  <th>Простой (ч)</th>
                  {canEditClaims && <th>Действия</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td data-label="Зав. №">{c.machine_serial}</td>
                    <td data-label="Дата отказа">{c.failure_date}</td>
                    <td data-label="Узел отказа">{c.failure_node}</td>
                    <td data-label="Описание">{c.failure_description}</td>
                    <td data-label="Восстановлено">{c.restored_date}</td>
                    <td data-label="Простой (ч)">{c.downtime_hours}</td>
                    {canEditClaims && (
                      <td className="actions" data-label="Действия">
                        <button
                          onClick={() => {
                            setEditingClaim(c);
                            setOpenClaim(true);
                          }}
                        >
                          ✎
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm("Удалить рекламацию?")) return;
                            try {
                              await deleteClaim(c.id);
                              const r = await authFetch(
                                "/api/claims/?ordering=machine__serial_number,-failure_date"
                              );
                              const d = await r.json();
                              setRows(Array.isArray(d) ? d : d.results || []);
                            } catch (e) {
                              alert(e.message || e);
                            }
                          }}
                        >
                          🗑
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
