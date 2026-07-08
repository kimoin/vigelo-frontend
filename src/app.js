const API_BASE = localStorage.getItem("vsrv_api_base") || "http://127.0.0.1:8090";

const state = {
  token: localStorage.getItem("vsrv_token") || "",
  user: null,
  households: [],
  selectedHouseholdId: localStorage.getItem("vsrv_household_id") || "",
  devices: [],
  selectedDeviceId: "",
  activity: null,
  alerts: [],
  message: "",
  error: "",
};

const app = document.getElementById("app");

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

function fmtWhen(iso) {
  if (!iso) return "not seen yet";
  const d = new Date(iso);
  const minutes = Math.round((Date.now() - d.getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} h ago`;
  return d.toLocaleString(undefined, { hour12: false });
}

function fmtVoltage(v) {
  if (v == null || Number.isNaN(Number(v))) return "unknown";
  return `${Number(v).toFixed(3)} V`;
}

function setMessage(message, error = "") {
  state.message = message;
  state.error = error;
  render();
}

async function api(path, opts = {}) {
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = new Error(data?.error?.message || `HTTP ${res.status}`);
    err.code = data?.error?.code;
    throw err;
  }
  return data;
}

async function signup(form) {
  const data = Object.fromEntries(new FormData(form));
  const res = await api("/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
  state.token = res.access_token;
  state.user = res.user;
  localStorage.setItem("vsrv_token", state.token);
  state.selectedHouseholdId = res.household?.id || "";
  if (state.selectedHouseholdId) localStorage.setItem("vsrv_household_id", state.selectedHouseholdId);
  await loadHome("Account created.");
}

async function login(form) {
  const data = Object.fromEntries(new FormData(form));
  const res = await api("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
  state.token = res.access_token;
  state.user = res.user;
  localStorage.setItem("vsrv_token", state.token);
  await loadHome("Welcome back.");
}

async function logout() {
  try {
    await api("/v1/auth/logout", { method: "POST", body: "{}" });
  } catch {
    // Local cleanup still matters if the backend session is already gone.
  }
  state.token = "";
  state.user = null;
  state.households = [];
  state.devices = [];
  state.selectedDeviceId = "";
  localStorage.removeItem("vsrv_token");
  render();
}

async function loadHome(message = "") {
  if (!state.token) {
    render();
    return;
  }
  const me = await api("/v1/me");
  const households = await api("/v1/households");
  state.user = me.user;
  state.households = households.households || [];
  if (!state.selectedHouseholdId && state.households[0]) {
    state.selectedHouseholdId = state.households[0].id;
    localStorage.setItem("vsrv_household_id", state.selectedHouseholdId);
  }
  await loadDevices();
  state.message = message;
  state.error = "";
  render();
}

async function loadDevices() {
  if (!state.selectedHouseholdId) {
    state.devices = [];
    return;
  }
  const res = await api(`/v1/households/${encodeURIComponent(state.selectedHouseholdId)}/devices`);
  state.devices = res.devices || [];
  if (!state.selectedDeviceId && state.devices[0]) state.selectedDeviceId = state.devices[0].id;
}

async function claimDevice(form) {
  const data = Object.fromEntries(new FormData(form));
  const dev = await api(`/v1/households/${encodeURIComponent(state.selectedHouseholdId)}/device-claims`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  state.selectedDeviceId = dev.id;
  await loadHome("Device added. Activate service to complete the MVP flow.");
}

async function activateSubscription(id) {
  await api(`/v1/devices/${encodeURIComponent(id)}/subscription/checkout`, {
    method: "POST",
    body: "{}",
  });
  await loadHome("Monitoring service activated.");
}

async function saveWindows(form, id) {
  const fd = new FormData(form);
  const windows = [];
  for (const n of ["1", "2"]) {
    const start = fd.get(`start_${n}`);
    const end = fd.get(`end_${n}`);
    if (start && end && start !== "none" && end !== "none") {
      windows.push({ start_time: start, end_time: end });
    }
  }
  await api(`/v1/devices/${encodeURIComponent(id)}/monitored-windows`, {
    method: "PUT",
    body: JSON.stringify({ windows }),
  });
  await loadHome("Monitored hours saved. Waiting for device delivery.");
}

async function loadActivity(id) {
  state.activity = await api(`/v1/devices/${encodeURIComponent(id)}/activity`);
  render();
}

async function loadAlerts(id) {
  const res = await api(`/v1/devices/${encodeURIComponent(id)}/alerts`);
  state.alerts = res.alerts || [];
  render();
}

async function ackAlert(deviceId, alertId) {
  await api(`/v1/devices/${encodeURIComponent(deviceId)}/alerts/${encodeURIComponent(alertId)}/ack`, {
    method: "POST",
    body: "{}",
  });
  await loadAlerts(deviceId);
  await loadHome("Alert acknowledged.");
}

async function registerPush(form) {
  const data = Object.fromEntries(new FormData(form));
  await api("/v1/push-tokens", {
    method: "POST",
    body: JSON.stringify(data),
  });
  setMessage("Push token registered with VSRV.");
}

function selectedDevice() {
  return state.devices.find((d) => d.id === state.selectedDeviceId) || state.devices[0] || null;
}

function render() {
  app.innerHTML = `
    <main class="shell">
      <header class="topbar">
        <div>
          <div class="eyebrow">Vigelo MVP</div>
          <h1>Mobile service prototype</h1>
        </div>
        ${state.token ? `<button class="ghost" data-action="logout">Logout</button>` : ""}
      </header>
      ${state.message ? `<div class="notice">${esc(state.message)}</div>` : ""}
      ${state.error ? `<div class="notice error">${esc(state.error)}</div>` : ""}
      ${state.token ? renderDashboard() : renderAuth()}
    </main>`;
  bind();
}

function renderAuth() {
  return `
    <section class="grid two">
      <form class="card" data-submit="signup">
        <h2>Create account</h2>
        <p class="muted">Creates a user, default household, and local session.</p>
        <label>Email<input name="email" type="email" value="demo@vigelo.test" required></label>
        <label>Display name<input name="display_name" value="Demo User"></label>
        <label>Password<input name="password" type="password" value="password123" required></label>
        <button>Create account</button>
      </form>
      <form class="card" data-submit="login">
        <h2>Login</h2>
        <p class="muted">Use an account already created in this backend process.</p>
        <label>Email<input name="email" type="email" value="demo@vigelo.test" required></label>
        <label>Password<input name="password" type="password" value="password123" required></label>
        <button>Login</button>
      </form>
    </section>`;
}

function renderDashboard() {
  const dev = selectedDevice();
  return `
    <section class="status-row">
      <div class="pill">API ${esc(API_BASE)}</div>
      <div class="pill">User ${esc(state.user?.email || "")}</div>
      <button class="secondary" data-action="refresh">Refresh</button>
    </section>
    <section class="grid ${dev ? "two" : ""}">
      <div>
        ${renderClaim()}
        ${renderDevices(dev)}
      </div>
      ${dev ? renderDeviceDetail(dev) : ""}
    </section>`;
}

function renderClaim() {
  const hh = state.households[0];
  if (!hh) return `<div class="card"><h2>No household</h2><p>Create a household from the backend API first.</p></div>`;
  return `
    <form class="card" data-submit="claim">
      <h2>Add Vigelo device</h2>
      <p class="muted">Paste a QR payload. A plain IMEI-like value works for the MVP.</p>
      <input type="hidden" name="household_id" value="${esc(hh.id)}">
      <label>QR payload<input name="qr_payload" value="device_id=860123456789012&key=dev" required></label>
      <label>Display name<input name="display_name" value="Living room"></label>
      <label>Room/location<input name="room_or_location_label" value="Living room"></label>
      <button>Add device</button>
    </form>`;
}

function renderDevices(selected) {
  return `
    <div class="card">
      <h2>Devices</h2>
      ${state.devices.length === 0 ? `<p class="muted">No devices yet. Add one above.</p>` : ""}
      <div class="list">
        ${state.devices.map((d) => `
          <button class="device-row ${selected?.id === d.id ? "active" : ""}" data-device="${esc(d.id)}">
            <span>
              <strong>${esc(d.display_name)}</strong>
              <small>${esc(d.room_or_location_label)} · ${esc(d.status)}</small>
            </span>
            <span class="badge">${esc(d.subscription_status)}</span>
          </button>`).join("")}
      </div>
    </div>`;
}

function renderDeviceDetail(dev) {
  return `
    <div class="stack">
      <section class="card hero">
        <div>
          <div class="eyebrow">Device</div>
          <h2>${esc(dev.display_name)}</h2>
          <p>${esc(dev.room_or_location_label)}</p>
        </div>
        <span class="status ${esc(dev.status)}">${esc(dev.status.replaceAll("_", " "))}</span>
      </section>
      <section class="grid two compact">
        <div class="metric"><span>Last seen</span><strong>${esc(fmtWhen(dev.last_seen_at))}</strong></div>
        <div class="metric"><span>Battery</span><strong>${esc(fmtVoltage(dev.battery_voltage_v))}</strong></div>
        <div class="metric"><span>Subscription</span><strong>${esc(dev.subscription_status)}</strong></div>
        <div class="metric"><span>Alerts</span><strong>${esc(dev.active_alert_count)}</strong></div>
      </section>
      ${renderSubscription(dev)}
      ${renderWindows(dev)}
      ${renderActivity(dev)}
      ${renderAlerts(dev)}
      ${renderPush()}
    </div>`;
}

function renderSubscription(dev) {
  return `
    <section class="card">
      <h2>Monitoring service</h2>
      <p class="muted">Subscription activates the device data service in VSRV.</p>
      <div class="row">
        <span class="badge">${esc(dev.subscription?.service_status || "service_limited")}</span>
        ${dev.subscription_status !== "active" ? `<button data-action="activate" data-id="${esc(dev.id)}">Activate service</button>` : ""}
      </div>
    </section>`;
}

function renderWindows(dev) {
  const w1 = dev.monitored_windows?.[0] || {};
  const w2 = dev.monitored_windows?.[1] || {};
  return `
    <form class="card" data-submit="windows" data-id="${esc(dev.id)}">
      <h2>Monitored hours</h2>
      <p class="muted">Local-time intent. Delivery state: <strong>${esc(dev.monitored_windows_delivery_state)}</strong></p>
      <div class="window-grid">
        ${timeSelect("start_1", w1.start_time || "08:00")}
        ${timeSelect("end_1", w1.end_time || "20:00")}
        ${timeSelect("start_2", w2.start_time || "none", true)}
        ${timeSelect("end_2", w2.end_time || "none", true)}
      </div>
      <button>Save monitored hours</button>
    </form>`;
}

function timeSelect(name, value, optional = false) {
  const opts = [];
  if (optional) opts.push(`<option value="none">No second window</option>`);
  for (let h = 0; h <= 24; h++) {
    const v = `${String(h).padStart(2, "0")}:00`;
    opts.push(`<option value="${v}" ${value === v ? "selected" : ""}>${v}</option>`);
  }
  return `<label>${name.replace("_", " ")}<select name="${name}">${opts.join("")}</select></label>`;
}

function renderActivity(dev) {
  const days = state.activity?.days || [];
  return `
    <section class="card">
      <div class="row">
        <h2>Activity</h2>
        <button class="secondary" data-action="activity" data-id="${esc(dev.id)}">Load activity</button>
      </div>
      ${days.length === 0 ? `<p class="muted">Load a local 7-day hourly activity preview.</p>` : `
        <div class="activity">
          ${days.map((day) => `
            <div class="activity-day">
              <strong>${esc(day.date)}</strong>
              <div class="hours">
                ${day.hours.map((h) => `<span title="${esc(h.start)}-${esc(h.end)}" class="${h.monitored ? "monitored" : ""} ${h.movement ? "movement" : ""}"></span>`).join("")}
              </div>
            </div>`).join("")}
        </div>`}
    </section>`;
}

function renderAlerts(dev) {
  return `
    <section class="card">
      <div class="row">
        <h2>Alerts</h2>
        <button class="secondary" data-action="alerts" data-id="${esc(dev.id)}">Load alerts</button>
      </div>
      ${state.alerts.length === 0 ? `<p class="muted">No loaded alerts yet.</p>` : `
        <div class="list">
          ${state.alerts.map((a) => `
            <div class="alert">
              <strong>${esc(a.title)}</strong>
              <p>${esc(a.body)}</p>
              <small>${esc(a.status)} · ${esc(fmtWhen(a.first_seen_at))}</small>
              ${a.status === "active" ? `<button class="secondary" data-action="ack" data-device-id="${esc(dev.id)}" data-alert-id="${esc(a.id)}">Acknowledge</button>` : ""}
            </div>`).join("")}
        </div>`}
    </section>`;
}

function renderPush() {
  return `
    <form class="card" data-submit="push">
      <h2>Push token demo</h2>
      <p class="muted">Registers a placeholder token with VSRV. Native APNs/FCM comes later.</p>
      <label>Platform<select name="platform"><option>ios</option><option>android</option><option>web</option></select></label>
      <label>Token<input name="token" value="dev-push-token-123456"></label>
      <button>Register push token</button>
    </form>`;
}

function bind() {
  document.querySelectorAll("form[data-submit]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const kind = form.dataset.submit;
        if (kind === "signup") await signup(form);
        if (kind === "login") await login(form);
        if (kind === "claim") await claimDevice(form);
        if (kind === "windows") await saveWindows(form, form.dataset.id);
        if (kind === "push") await registerPush(form);
      } catch (err) {
        setMessage("", err.message);
      }
    });
  });
  document.querySelectorAll("[data-action]").forEach((el) => {
    el.addEventListener("click", async () => {
      try {
        const action = el.dataset.action;
        if (action === "logout") await logout();
        if (action === "refresh") await loadHome("Refreshed.");
        if (action === "activate") await activateSubscription(el.dataset.id);
        if (action === "activity") await loadActivity(el.dataset.id);
        if (action === "alerts") await loadAlerts(el.dataset.id);
        if (action === "ack") await ackAlert(el.dataset.deviceId, el.dataset.alertId);
      } catch (err) {
        setMessage("", err.message);
      }
    });
  });
  document.querySelectorAll("[data-device]").forEach((el) => {
    el.addEventListener("click", () => {
      state.selectedDeviceId = el.dataset.device;
      state.activity = null;
      state.alerts = [];
      render();
    });
  });
}

loadHome().catch(() => {
  state.token = "";
  localStorage.removeItem("vsrv_token");
  render();
});
