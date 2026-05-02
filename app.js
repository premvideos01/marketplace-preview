// =================== Categories (frontend constant) ===================
const CATEGORIES = [
  { id: "all",          name: "All",          ico: "✨" },
  { id: "electronics",  name: "Electronics",  ico: "📱" },
  { id: "phones",       name: "Phones",       ico: "📞" },
  { id: "computers",    name: "Computers",    ico: "💻" },
  { id: "furniture",    name: "Furniture",    ico: "🛋️" },
  { id: "appliances",   name: "Appliances",   ico: "🔌" },
  { id: "home",         name: "Home",         ico: "🏡" },
  { id: "garden",       name: "Garden",       ico: "🌱" },
  { id: "vehicles",     name: "Cars",         ico: "🚗" },
  { id: "motorcycles",  name: "Motos",        ico: "🏍️" },
  { id: "boats",        name: "Boats",        ico: "⛵" },
  { id: "marine",       name: "Marine gear",  ico: "⚓" },
  { id: "auto-parts",   name: "Auto parts",   ico: "🔩" },
  { id: "rvs",          name: "RVs",          ico: "🚐" },
  { id: "real-estate",  name: "Real estate",  ico: "🏠" },
  { id: "clothing",     name: "Clothing",     ico: "👕" },
  { id: "shoes",        name: "Shoes",        ico: "👟" },
  { id: "jewelry",      name: "Jewelry",      ico: "💎" },
  { id: "watches",      name: "Watches",      ico: "⌚" },
  { id: "beauty",       name: "Beauty",       ico: "💄" },
  { id: "sports",       name: "Sports",       ico: "🏀" },
  { id: "bikes",        name: "Bicycles",     ico: "🚲" },
  { id: "toys",         name: "Toys",         ico: "🧸" },
  { id: "baby",         name: "Baby & Kids",  ico: "👶" },
  { id: "pets",         name: "Pets",         ico: "🐾" },
  { id: "tools",        name: "Tools",        ico: "🔧" },
  { id: "books",        name: "Books",        ico: "📚" },
  { id: "music",        name: "Music",        ico: "🎸" },
  { id: "gaming",       name: "Gaming",       ico: "🎮" },
  { id: "collectibles", name: "Collectibles", ico: "🏆" },
  { id: "art",          name: "Art",          ico: "🎨" },
  { id: "office",       name: "Office",       ico: "🖨️" },
  { id: "services",     name: "Services",     ico: "🛠️" },
  { id: "jobs",         name: "Jobs",         ico: "💼" },
  { id: "free",         name: "Free",         ico: "🎁" },
];
const CAT_ICON = Object.fromEntries(CATEGORIES.map(c => [c.id, c.ico]));

// =================== State ===================
const state = {
  view: "home",
  category: "all",
  query: "",
  zips: null,
  saved: new Set(),
  sort: "newest",
  priceFilter: "all",
  postPhotos: [],     // uploaded photo URLs
  currentConv: null,  // open conversation
  viewStack: ["home"]
};

// =================== Helpers ===================
const $  = (q, r = document) => r.querySelector(q);
const $$ = (q, r = document) => Array.from(r.querySelectorAll(q));

function priceLabel(p) { return p === 0 ? "Free" : "$" + Number(p).toLocaleString(); }
function postedLabel(secAgo) {
  const m = Math.floor(secAgo / 60);
  if (m < 1)  return "just now";
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  const d = Math.floor(h / 24);
  if (d < 7)  return d + "d ago";
  return Math.floor(d / 7) + "w ago";
}
function postedFromTs(ts) { return postedLabel(Math.max(0, Math.floor(Date.now() / 1000 - ts))); }
function escHtml(s) { return String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function toast(msg, ms = 2200) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.hidden = true, ms);
}
function showError(elId, err) {
  const el = $("#" + elId);
  el.textContent = err && err.message ? err.message : String(err);
  el.hidden = false;
}
function clearError(elId) { const el = $("#" + elId); el.hidden = true; el.textContent = ""; }

// =================== Routing ===================
function go(view) {
  if (view !== state.view) state.viewStack.push(view);
  state.view = view;
  $$(".view").forEach(v => v.hidden = v.dataset.view !== view);
  $$(".tab").forEach(t => t.classList.toggle("active", t.dataset.go === view));
  // Hide tabbar on onboarding screens
  const onboard = ["setup", "login", "signup"].includes(view);
  $("#tabbar").hidden = onboard;
  // View-enter hooks
  if (view === "home")    loadHomeListings();
  if (view === "search")  setTimeout(() => $("#searchInput").focus(), 80);
  if (view === "saved")   loadSaved();
  if (view === "inbox")   loadInbox();
  if (view === "profile") renderProfile();
  if (view === "admin")   loadAdmin();
}
function back() {
  state.viewStack.pop();
  const prev = state.viewStack[state.viewStack.length - 1] || "home";
  state.view = ""; // force re-enter
  go(prev);
}

document.addEventListener("click", e => {
  const back_ = e.target.closest("[data-back]");
  if (back_) { e.preventDefault(); back(); return; }
  const dest = e.target.closest("[data-go]");
  if (dest) { e.preventDefault(); go(dest.dataset.go); return; }
  const reset = e.target.closest("[data-reset-backend]");
  if (reset) { e.preventDefault(); Api.setBase(null); Api.logout(); go("setup"); return; }
});

// =================== Boot ===================
async function boot() {
  if (!Api.base())   { go("setup"); return; }
  if (!Api.token())  { go("login"); return; }
  try {
    const r = await Api.me();
    Api.setUser(r.user);
    bootApp();
  } catch (e) {
    if (e.status === 401) { Api.logout(); go("login"); }
    else { toast("Backend unreachable: " + e.message); go("login"); }
  }
}

function bootApp() {
  renderHomeCats();
  renderTrending();
  populatePostCategories();
  Api.connectWS(onIncomingMessage);
  go("home");
  // Lazy load saved set so hearts render correctly
  Api.saved().then(r => {
    state.saved = new Set((r.listings || []).map(l => l.id));
    renderListingsGrid(); // refresh hearts
  }).catch(() => {});
}

// =================== Setup screen ===================
$("#setupSave").onclick = () => {
  const url = $("#setupUrl").value.trim();
  if (!/^https?:\/\//i.test(url)) { toast("Enter a full URL (https://…)"); return; }
  Api.setBase(url);
  go(Api.token() ? "home" : "login");
  if (Api.token()) bootApp();
};

// =================== Login / Signup ===================
$("#loginGo").onclick = async () => {
  clearError("loginErr");
  const email = $("#loginEmail").value.trim();
  const pass  = $("#loginPass").value;
  if (!email || !pass) return showError("loginErr", "Enter email and password");
  try {
    const r = await Api.login(email, pass);
    Api.setToken(r.token);
    Api.setUser(r.user);
    bootApp();
  } catch (e) { showError("loginErr", e); }
};

$("#suGo").onclick = async () => {
  clearError("suErr");
  const email = $("#suEmail").value.trim();
  const user  = $("#suUser").value.trim();
  const name  = $("#suName").value.trim();
  const pass  = $("#suPass").value;
  if (!email || !user || !pass) return showError("suErr", "Email, username and password are required");
  try {
    const r = await Api.signup(email, pass, user, name || user);
    Api.setToken(r.token);
    Api.setUser(r.user);
    bootApp();
  } catch (e) { showError("suErr", e); }
};

// =================== Home: categories ===================
function renderHomeCats() {
  $("#catGrid").innerHTML = CATEGORIES.map(c =>
    `<button class="cat-tile ${c.id === state.category ? "active" : ""}" data-cat="${c.id}">
       <span class="ico">${c.ico}</span><span class="nm">${c.name}</span>
     </button>`).join("");
  $$("#catGrid [data-cat]").forEach(b => {
    b.onclick = () => { state.category = b.dataset.cat; renderHomeCats(); loadHomeListings(); };
  });
}
function renderTrending() {
  $("#trendingGrid").innerHTML = CATEGORIES.slice(1, 7).map(c =>
    `<button class="cat-tile" data-tcat="${c.id}">
       <span class="ico">${c.ico}</span><span class="nm">${c.name}</span>
     </button>`).join("");
  $$("#trendingGrid [data-tcat]").forEach(b => {
    b.onclick = () => { state.category = b.dataset.tcat; go("home"); renderHomeCats(); };
  });
}
function populatePostCategories() {
  const sel = $("#poCategory");
  sel.innerHTML = CATEGORIES.slice(1).map(c => `<option value="${c.id}">${c.name}</option>`).join("");
}

// =================== Listings ===================
let _homeListings = [];
async function loadHomeListings() {
  const params = { sort: state.sort };
  if (state.category && state.category !== "all") params.category = state.category;
  if (state.priceFilter !== "all") params.max_price = parseInt(state.priceFilter, 10);
  if (state.query) params.q = state.query;
  try {
    const r = await Api.listings(params);
    _homeListings = r.listings || [];
    renderListingsGrid();
  } catch (e) {
    if (e.status === 402) {
      $("#grid").innerHTML = `<div class="empty">This marketplace is currently premium-only. Contact the admin for access.</div>`;
    } else {
      $("#grid").innerHTML = `<div class="empty">Couldn't load listings: ${escHtml(e.message)}</div>`;
    }
  }
}

function cardHtml(it) {
  const photo = (it.photos && it.photos[0]) || "https://placehold.co/600x600/eee/aaa?text=No+photo";
  const heartOn = state.saved.has(it.id);
  const where = it.city && it.state ? `${it.city}, ${it.state}` : (it.zip || "Local");
  return `
    <div class="card" data-id="${it.id}">
      <div class="thumb" style="background-image:url(${escHtml(photo)})"></div>
      <button class="heart ${heartOn ? "on" : ""}" data-heart="${it.id}" aria-label="Save">${heartOn ? "♥" : "♡"}</button>
      <div class="info">
        <div class="price">${priceLabel(it.price)}</div>
        <div class="title">${escHtml(it.title)}</div>
        <div class="meta">${escHtml(where)} · ${postedFromTs(it.created_at)}</div>
      </div>
    </div>`;
}
function bindCards(container) {
  container.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", e => {
      if (e.target.closest("[data-heart]")) return;
      const id = parseInt(card.dataset.id, 10);
      openDetailById(id);
    });
  });
  container.querySelectorAll("[data-heart]").forEach(b => {
    b.addEventListener("click", e => {
      e.stopPropagation();
      toggleSaved(parseInt(b.dataset.heart, 10));
    });
  });
}
function renderListingsGrid() {
  const el = $("#grid");
  if (_homeListings.length === 0) {
    el.innerHTML = `<div class="empty">No items yet — try posting something or changing filters.</div>`;
    return;
  }
  el.innerHTML = _homeListings.map(cardHtml).join("");
  bindCards(el);
}

async function toggleSaved(id) {
  const wasSaved = state.saved.has(id);
  if (wasSaved) state.saved.delete(id); else state.saved.add(id);
  // Optimistic UI
  renderListingsGrid();
  if (state.view === "saved") loadSaved();
  if ($("#searchResults")) renderSearchResults();
  try {
    if (wasSaved) await Api.unsave(id); else await Api.save(id);
  } catch (e) {
    // Roll back on error
    if (wasSaved) state.saved.add(id); else state.saved.delete(id);
    renderListingsGrid();
    toast("Couldn't save: " + e.message);
  }
}

// =================== Detail ===================
let _currentDetail = null;
async function openDetailById(id) {
  try {
    const r = await Api.listing(id);
    openDetail(r.listing);
  } catch (e) { toast("Can't open: " + e.message); }
}

function openDetail(it) {
  _currentDetail = it;
  const photos = (it.photos && it.photos.length) ? it.photos : ["https://placehold.co/800x600/eee/aaa?text=No+photo"];
  const slides = photos.map(src => `<div class="slide" style="background-image:url(${escHtml(src)})"></div>`).join("");
  const dots = photos.map((_, i) => `<span class="dot ${i === 0 ? "active" : ""}"></span>`).join("");
  const where = it.city && it.state ? `${it.city}, ${it.state}` : (it.zip || "Local");
  const sellerName = it.seller_name || it.seller_username || "Seller";

  $("#detailScroll").innerHTML = `
    <div class="gallery" id="gallery">${slides}</div>
    <div class="dots" id="dots">${dots}</div>
    <div class="detail-body">
      <div class="detail-price">${priceLabel(it.price)}</div>
      <div class="detail-title">${escHtml(it.title)}</div>
      <div class="detail-meta">📍 ${escHtml(where)} · posted ${postedFromTs(it.created_at)}</div>
      ${it.condition ? `<div class="detail-section"><h4>Condition</h4><p>${escHtml(it.condition)}</p></div>` : ""}
      ${it.description ? `<div class="detail-section"><h4>Description</h4><p>${escHtml(it.description)}</p></div>` : ""}
      <div class="seller">
        <div class="avatar">${escHtml(sellerName[0] || "?")}</div>
        <div class="who"><b>${escHtml(sellerName)}</b><span>@${escHtml(it.seller_username || "")}${it.seller_premium ? " · Premium" : ""}</span></div>
      </div>
    </div>`;

  const heart = $("#detailHeart");
  const on = state.saved.has(it.id);
  heart.textContent = on ? "♥" : "♡";
  heart.onclick = () => toggleSaved(it.id);

  const gallery = $("#gallery");
  const dotEls = $$("#dots .dot");
  gallery.onscroll = () => {
    const idx = Math.round(gallery.scrollLeft / gallery.clientWidth);
    dotEls.forEach((d, i) => d.classList.toggle("active", i === idx));
  };

  $("#msgSeller").onclick = () => promptMessageSeller(it, "Hi, is this still available?");
  $("#makeOffer").onclick = () => {
    const offer = prompt("Your offer (number)?");
    if (!offer) return;
    promptMessageSeller(it, `Would you take $${parseInt(offer, 10)}?`);
  };

  go("detail");
}

async function promptMessageSeller(listing, body) {
  if (!body) return;
  if (listing.user_id === Api.user().id) { toast("Can't message your own listing"); return; }
  try {
    const r = await Api.startConversation(listing.id, body);
    toast("Message sent");
    openConversation(r.conversation.id);
  } catch (e) { toast(e.message); }
}

// =================== Saved ===================
async function loadSaved() {
  try {
    const r = await Api.saved();
    const items = r.listings || [];
    state.saved = new Set(items.map(l => l.id));
    const el = $("#savedGrid");
    if (items.length === 0) {
      el.innerHTML = `<div class="empty">No saved items yet. Tap ♡ on any listing.</div>`;
    } else {
      el.innerHTML = items.map(cardHtml).join("");
      bindCards(el);
    }
    $("#savedCount").textContent = String(items.length);
  } catch (e) { toast("Saved: " + e.message); }
}

// =================== Search ===================
let _searchDebounce;
$("#searchInput").addEventListener("input", e => {
  state.query = e.target.value.trim();
  $("#clearSearch").hidden = !state.query;
  clearTimeout(_searchDebounce);
  _searchDebounce = setTimeout(renderSearchResults, 180);
});
$("#clearSearch").onclick = () => { $("#searchInput").value = ""; state.query = ""; $("#clearSearch").hidden = true; renderSearchResults(); };

async function renderSearchResults() {
  const head = $("#resultsHead");
  const out  = $("#searchResults");
  if (!state.query) { head.hidden = true; out.innerHTML = ""; return; }
  head.hidden = false;
  try {
    const r = await Api.listings({ q: state.query, sort: "newest" });
    const items = r.listings || [];
    if (items.length === 0) { out.innerHTML = `<div class="empty">No items match "${escHtml(state.query)}".</div>`; return; }
    out.innerHTML = items.map(cardHtml).join("");
    bindCards(out);
  } catch (e) {
    out.innerHTML = `<div class="empty">${escHtml(e.message)}</div>`;
  }
}

// =================== Filters ===================
$("[data-show-filters]").onclick = () => { const r = $("#filterRow"); r.hidden = !r.hidden; };
$("#sortSel").onchange = e => { state.sort = e.target.value; loadHomeListings(); };
$$("[data-price]").forEach(b => {
  b.onclick = () => {
    state.priceFilter = b.dataset.price;
    $$("[data-price]").forEach(x => x.classList.toggle("active", x === b));
    loadHomeListings();
  };
});

// =================== Post ===================
$("#photoInput").addEventListener("change", async e => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;
  const strip = $("#photoStrip");
  // Show local previews instantly
  for (const f of files) {
    const url = URL.createObjectURL(f);
    const wrap = document.createElement("div");
    wrap.className = "ph";
    wrap.style.backgroundImage = `url(${url})`;
    wrap.innerHTML = `<button title="remove">×</button>`;
    strip.appendChild(wrap);
  }
  try {
    const r = await Api.uploadPhotos(files);
    state.postPhotos.push(...(r.urls || []));
    // Replace local previews with server URLs
    const phs = strip.querySelectorAll(".ph");
    phs.forEach((ph, i) => {
      const url = state.postPhotos[i];
      if (url) {
        ph.style.backgroundImage = `url(${url})`;
        ph.querySelector("button").onclick = () => {
          const idx = Array.from(strip.children).indexOf(ph);
          state.postPhotos.splice(idx, 1);
          ph.remove();
        };
      }
    });
  } catch (e) {
    toast("Upload failed: " + e.message);
    strip.innerHTML = "";
  }
  e.target.value = "";
});

$("#postPublish").onclick = async () => {
  clearError("poErr");
  const title = $("#poTitle").value.trim();
  const price = parseInt($("#poPrice").value, 10);
  const category = $("#poCategory").value;
  const condition = $("#poCond").value;
  const description = $("#poDesc").value.trim();
  const zip = $("#poZip").value.trim();
  if (!title || isNaN(price) || price < 0) return showError("poErr", "Title and a valid price are required.");
  try {
    await Api.createListing({
      title, price, category, condition, description, zip,
      photo_urls: state.postPhotos.slice()
    });
    toast("Listed!");
    // Reset form
    $("#poTitle").value = ""; $("#poPrice").value = ""; $("#poDesc").value = ""; $("#poZip").value = "";
    $("#photoStrip").innerHTML = "";
    state.postPhotos = [];
    go("home");
    loadHomeListings();
  } catch (e) { showError("poErr", e); }
};

// =================== Inbox ===================
async function loadInbox() {
  try {
    const r = await Api.conversations();
    const convs = r.conversations || [];
    const el = $("#convList");
    if (convs.length === 0) { el.innerHTML = `<div class="empty" style="padding:40px 20px;text-align:center;color:var(--muted)">No messages yet.</div>`; return; }
    el.innerHTML = convs.map(c => {
      const photo = c.listing_photo || "https://placehold.co/120x120/eee/aaa?text=?";
      const when = c.last_at ? postedFromTs(c.last_at) : postedFromTs(c.created_at);
      return `
        <li class="conv ${c.unread > 0 ? "unread" : ""}" data-conv="${c.id}">
          <div class="ph" style="background-image:url(${escHtml(photo)})"></div>
          <div class="body">
            <div class="head"><b>${escHtml(c.other.name || c.other.username || "User")}</b><span class="when">${when}</span></div>
            <div class="item">${escHtml(c.listing_title || "")}</div>
            <div class="last">${escHtml(c.last_body || "(no messages yet)")}</div>
          </div>
        </li>`;
    }).join("");
    el.querySelectorAll("[data-conv]").forEach(li => {
      li.onclick = () => openConversation(parseInt(li.dataset.conv, 10));
    });
  } catch (e) {
    $("#convList").innerHTML = `<div class="empty" style="padding:40px 20px;text-align:center;color:var(--muted)">${escHtml(e.message)}</div>`;
  }
}

async function openConversation(id) {
  state.currentConv = id;
  try {
    const conv = (await Api.conversations()).conversations.find(c => c.id === id);
    const r = await Api.messages(id);
    renderConv(conv, r.messages || []);
    go("conv");
  } catch (e) { toast(e.message); }
}

function renderConv(conv, msgs) {
  if (conv) {
    $("#convHeader").innerHTML = `<b>${escHtml(conv.other.name || conv.other.username || "User")}</b><span>${escHtml(conv.listing_title || "")}</span>`;
  }
  const me = Api.user().id;
  const scroll = $("#msgScroll");
  scroll.innerHTML = msgs.map(m => {
    const cls = m.sender_id === me ? "me" : "them";
    return `<div class="msg-bubble ${cls}">${escHtml(m.body)}</div>`;
  }).join("");
  setTimeout(() => { scroll.scrollTop = scroll.scrollHeight; }, 0);
}

$("#msgForm").onsubmit = async e => {
  e.preventDefault();
  const input = $("#msgInput");
  const body = input.value.trim();
  if (!body || !state.currentConv) return;
  input.value = "";
  try {
    const r = await Api.sendMessage(state.currentConv, body);
    const scroll = $("#msgScroll");
    scroll.insertAdjacentHTML("beforeend", `<div class="msg-bubble me">${escHtml(body)}</div>`);
    scroll.scrollTop = scroll.scrollHeight;
  } catch (e) { toast(e.message); input.value = body; }
};

function onIncomingMessage(payload) {
  if (payload.type !== "message") return;
  if (state.view === "conv" && state.currentConv === payload.conversation_id) {
    const scroll = $("#msgScroll");
    scroll.insertAdjacentHTML("beforeend", `<div class="msg-bubble them">${escHtml(payload.message.body)}</div>`);
    scroll.scrollTop = scroll.scrollHeight;
  } else {
    toast("New message");
  }
}

// =================== Profile ===================
async function renderProfile() {
  const u = Api.user();
  if (!u) return;
  $("#profAvatar").textContent = (u.display_name || u.username || "?")[0].toUpperCase();
  $("#profName").textContent = u.display_name || u.username;
  $("#profMeta").textContent = "@" + u.username + (u.is_admin ? " · admin" : "");
  $("#profPremium").textContent = u.is_premium ? "Pro" : "Free";
  $("#adminEntry").hidden = !u.is_admin;
  try {
    const r = await Api.myListings();
    const items = r.listings || [];
    $("#profListed").textContent = items.length;
    const el = $("#myListings");
    if (items.length === 0) {
      el.innerHTML = `<div class="empty">No listings yet. Tap + to create one.</div>`;
    } else {
      el.innerHTML = items.map(cardHtml).join("");
      bindCards(el);
    }
  } catch {}
  try {
    const r = await Api.saved();
    state.saved = new Set((r.listings || []).map(l => l.id));
    $("#savedCount").textContent = String(state.saved.size);
  } catch {}
}

$("#logoutBtn").onclick = () => {
  if (!confirm("Sign out?")) return;
  Api.logout();
  go("login");
};

// =================== Admin ===================
async function loadAdmin() {
  try {
    const s = await Api.adminStats();
    const stats = s.stats;
    $("#adminStats").innerHTML = [
      ["Users", stats.users],
      ["Premium", stats.premium_users],
      ["Active listings", stats.listings_active],
      ["Total listings", stats.listings_total],
      ["Conversations", stats.conversations],
      ["Messages", stats.messages],
      ["Sign-ups (24h)", stats.sign_ups_24h],
      ["Listings (24h)", stats.listings_24h],
    ].map(([k, v]) => `<div class="card-stat"><b>${v}</b><span>${k}</span></div>`).join("");
    $$('input[name="mode"]').forEach(r => r.checked = (r.value === s.mode));
  } catch (e) { toast("Admin: " + e.message); }
  loadAdminUsers("");
}

$("#modeSave").onclick = async () => {
  const mode = $$('input[name="mode"]').find(r => r.checked)?.value;
  if (!mode) return;
  try { await Api.adminUpdateSettings({ mode }); toast("Mode set: " + mode); }
  catch (e) { toast(e.message); }
};

let _adminUserDebounce;
$("#adminUserSearch").addEventListener("input", e => {
  clearTimeout(_adminUserDebounce);
  _adminUserDebounce = setTimeout(() => loadAdminUsers(e.target.value), 200);
});

async function loadAdminUsers(q) {
  try {
    const r = await Api.adminUsers(q);
    const users = r.users || [];
    const el = $("#adminUserList");
    if (users.length === 0) { el.innerHTML = `<div class="muted" style="padding:14px">No users.</div>`; return; }
    el.innerHTML = users.map(u => {
      const badges = [
        u.is_admin ? `<span class="badge admin">admin</span>` : "",
        u.is_premium ? `<span class="badge">premium</span>` : ""
      ].join("");
      return `
        <div class="user-row" data-uid="${u.id}">
          <div class="who"><b>${escHtml(u.display_name || u.username)}</b><span>@${escHtml(u.username)} · ${escHtml(u.email)}</span></div>
          <div class="badges">${badges}</div>
          <div class="actions">
            <button data-act="premium" data-on="${u.is_premium ? 0 : 1}">${u.is_premium ? "Remove ★" : "Grant ★"}</button>
            <button data-act="admin" data-on="${u.is_admin ? 0 : 1}">${u.is_admin ? "Demote" : "Make admin"}</button>
          </div>
        </div>`;
    }).join("");
    el.querySelectorAll(".user-row").forEach(row => {
      const uid = parseInt(row.dataset.uid, 10);
      row.querySelectorAll("[data-act]").forEach(b => {
        b.onclick = async () => {
          const act = b.dataset.act;
          const on = b.dataset.on === "1";
          const patch = act === "premium" ? { is_premium: on } : { is_admin: on };
          try { await Api.adminUpdateUser(uid, patch); loadAdminUsers($("#adminUserSearch").value); }
          catch (e) { toast(e.message); }
        };
      });
    });
  } catch (e) { toast(e.message); }
}

// =================== ZIP picker ===================
async function loadZips() {
  if (state.zips) return state.zips;
  const res = await fetch("data/us_zips.json");
  const raw = await res.json();
  state.zips = raw.map(r => ({ zip: r[0], city: r[1], state: r[2], county: r[3], lat: r[4], lng: r[5] }));
  return state.zips;
}
const zipModal = $("#zipModal"), zipList = $("#zipList"), zipSearch = $("#zipSearch");
$("#locChip").onclick = async () => {
  zipModal.hidden = false; zipSearch.value = ""; zipSearch.focus();
  const zips = await loadZips();
  renderZipList(zips.slice(0, 50));
};
$("#zipClose").onclick = () => zipModal.hidden = true;
function renderZipList(items) {
  if (items.length === 0) { zipList.innerHTML = `<li class="empty">No matches.</li>`; return; }
  zipList.innerHTML = items.slice(0, 200).map(z =>
    `<li data-zip="${z.zip}" data-city="${escHtml(z.city)}" data-state="${z.state}">
       <span class="city">${escHtml(z.city)}, ${z.state}</span>
       <span class="zip-code">${z.zip}</span>
     </li>`).join("");
}
zipList.addEventListener("click", async e => {
  const li = e.target.closest("li");
  if (!li || !li.dataset.zip) return;
  const zip = li.dataset.zip, city = li.dataset.city, st = li.dataset.state;
  $("#locLabel").textContent = `${city}, ${st}  ${zip}`;
  zipModal.hidden = true;
  try { await Api.put("/api/profile/me", { zip, city, state: st }); } catch {}
});
let zipDebounce;
zipSearch.addEventListener("input", () => {
  clearTimeout(zipDebounce);
  zipDebounce = setTimeout(async () => {
    const q = zipSearch.value.trim().toLowerCase();
    const zips = await loadZips();
    if (!q) return renderZipList(zips.slice(0, 50));
    const matches = [];
    for (const z of zips) {
      if (z.zip.startsWith(q) || z.city.toLowerCase().startsWith(q) ||
          z.state.toLowerCase() === q || (z.city + ", " + z.state).toLowerCase().includes(q)) {
        matches.push(z);
        if (matches.length >= 200) break;
      }
    }
    renderZipList(matches);
  }, 80);
});

// =================== Go ===================
boot();
