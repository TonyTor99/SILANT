export const BASE = "http://127.0.0.1:8000";

export function getToken() {
  return localStorage.getItem("access_token") || "";
}

export function setToken(token) {
  if (token) localStorage.setItem("access_token", token);
  else localStorage.removeItem("access_token");
}

export async function authFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(`${BASE}${path}`, { ...options, headers });
}

export async function login(username, password) {
  const res = await fetch(`${BASE}/api/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    let msg = "Ошибка входа";
    try {
      const data = await res.json();
      msg = data.detail || msg;
    } catch {}
    throw new Error(msg);
  }
  const data = await res.json();
  setToken(data.access);
  return data;
}

export async function getMe() {
  const res = await authFetch("/api/me/");
  if (!res.ok) throw new Error("Не удалось получить профиль");
  return res.json();
}

export function resolveRole(me) {
  if (me.is_staff || me.groups?.includes("Менеджер")) return "manager";
  if (me.groups?.includes("Сервисная организация")) return "service";
  if (me.groups?.includes("Клиент")) return "client";
  return "unknown";
}

export async function createMaintenance(payload) {
  const r = await authFetch("/api/maintenance/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function updateMaintenance(id, patch) {
  const r = await authFetch(`/api/maintenance/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function deleteMaintenance(id) {
  const r = await authFetch(`/api/maintenance/${id}/`, { method: "DELETE" });
  if (!r.ok) throw new Error(await r.text());
  return true;
}

export async function createClaim(form) {
  const payload = { ...form };
  if (payload.machine && !payload.machine_id) {
    payload.machine_id = payload.machine;
    delete payload.machine;
  }
  return authFetch("/api/claims/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateClaim(id, form) {
  const payload = { ...form };
  if (payload.machine && !payload.machine_id) {
    payload.machine_id = payload.machine;
    delete payload.machine;
  }
  return authFetch(`/api/claims/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteClaim(id) {
  return authFetch(`/api/claims/${id}/`, { method: "DELETE" });
}

export async function createMachine(form) {
  return authFetch("/api/machines/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
}

export async function updateMachine(id, form) {
  return authFetch(`/api/machines/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
}

export async function deleteMachine(id) {
  return authFetch(`/api/machines/${id}/`, {
    method: "DELETE",
  });
}

export async function getMachine(id) {
  const r = await authFetch(`/api/machines/${id}/`);
  if (!r.ok) throw new Error(`Ошибка ${r.status}`);
  return r.json();
}
