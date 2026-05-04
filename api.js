// =================== API client ===================
// Talks to the marketplace-server backend. Configurable URL stored in localStorage.

const LS_API   = "mkt.api_base";
const LS_TOKEN = "mkt.token";
const LS_USER  = "mkt.user";

const Api = {
  base() {
    const stored = localStorage.getItem(LS_API);
    if (stored) return stored;
    // Auto-detect: if served from a non-GitHub-Pages origin, assume backend is same origin
    if (location.hostname !== "premvideos01.github.io" && location.hostname !== "") {
      return location.origin;
    }
    return "";
  },
  setBase(url) {
    url = String(url || "").trim().replace(/\/$/, "");
    if (url) localStorage.setItem(LS_API, url); else localStorage.removeItem(LS_API);
  },

  token()    { return localStorage.getItem(LS_TOKEN); },
  setToken(t){ if (t) localStorage.setItem(LS_TOKEN, t); else localStorage.removeItem(LS_TOKEN); },

  user()     { try { return JSON.parse(localStorage.getItem(LS_USER) || "null"); } catch { return null; } },
  setUser(u) { if (u) localStorage.setItem(LS_USER, JSON.stringify(u)); else localStorage.removeItem(LS_USER); },

  isLoggedIn() { return !!this.token() && !!this.user(); },
  isAdmin()    { const u = this.user(); return !!(u && u.is_admin); },

  async request(method, path, body) {
    const base = this.base();
    if (!base) throw new Error("No backend URL configured");
    const headers = { "Accept": "application/json" };
    const opts = { method, headers };
    if (body instanceof FormData) {
      opts.body = body;
    } else if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
    const tok = this.token();
    if (tok) headers["Authorization"] = "Bearer " + tok;
    const res = await fetch(base + path, opts);
    let data = null;
    try { data = await res.json(); } catch {}
    if (!res.ok) {
      const err = new Error((data && data.error) || `HTTP ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  get(p)        { return this.request("GET", p); },
  post(p, b)    { return this.request("POST", p, b); },
  put(p, b)     { return this.request("PUT", p, b); },
  delete(p)     { return this.request("DELETE", p); },

  logout() {
    this.setToken(null);
    this.setUser(null);
    if (this._ws) { try { this._ws.close(); } catch {} this._ws = null; }
  },

  // ============ Convenience wrappers ============
  signup(email, password, username, display_name) {
    return this.post("/api/auth/signup", { email, password, username, display_name });
  },
  login(email, password) { return this.post("/api/auth/login", { email, password }); },
  me()                    { return this.get("/api/auth/me"); },

  listings(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.get("/api/listings" + (q ? "?" + q : ""));
  },
  listing(id) { return this.get("/api/listings/" + id); },
  myListings() { return this.get("/api/listings/mine/all"); },
  createListing(data) { return this.post("/api/listings", data); },
  updateListing(id, data) { return this.put("/api/listings/" + id, data); },
  deleteListing(id) { return this.delete("/api/listings/" + id); },

  uploadPhotos(files) {
    const fd = new FormData();
    for (const f of files) fd.append("files", f);
    return this.post("/api/uploads", fd);
  },

  saved() { return this.get("/api/saved"); },
  save(id) { return this.post("/api/saved/" + id); },
  unsave(id) { return this.delete("/api/saved/" + id); },

  conversations() { return this.get("/api/conversations"); },
  messages(convId) { return this.get("/api/conversations/" + convId + "/messages"); },
  startConversation(listing_id, body) { return this.post("/api/conversations", { listing_id, body }); },
  sendMessage(conversation_id, body) { return this.post("/api/messages", { conversation_id, body }); },

  // Bookings (services)
  createBooking(data)              { return this.post("/api/bookings", data); },
  updateBooking(id, patch)         { return this.request("PATCH", "/api/bookings/" + id, patch); },
  myBookings(role = "buyer")       { return this.get("/api/bookings/mine?role=" + encodeURIComponent(role)); },

  // Reviews (services)
  createReview(data)               { return this.post("/api/reviews", data); },
  reviewsForUser(userId)           { return this.get("/api/reviews/user/" + userId); },

  // Admin
  adminStats()       { return this.get("/api/admin/stats"); },
  adminUsers(q = "") { return this.get("/api/admin/users?q=" + encodeURIComponent(q)); },
  adminUpdateUser(id, patch) { return this.put("/api/admin/users/" + id, patch); },
  adminSettings()    { return this.get("/api/admin/settings"); },
  adminUpdateSettings(patch) { return this.put("/api/admin/settings", patch); },

  // WebSocket
  _ws: null,
  connectWS(onMessage) {
    this.disconnectWS();
    const base = this.base();
    if (!base || !this.token()) return;
    const wsUrl = base.replace(/^http/, "ws") + "/?token=" + encodeURIComponent(this.token());
    try {
      const ws = new WebSocket(wsUrl);
      this._ws = ws;
      ws.onmessage = e => {
        try { onMessage(JSON.parse(e.data)); } catch {}
      };
      ws.onclose = () => { if (this._ws === ws) this._ws = null; };
    } catch {}
  },
  disconnectWS() {
    if (this._ws) { try { this._ws.close(); } catch {} this._ws = null; }
  }
};

window.Api = Api;
