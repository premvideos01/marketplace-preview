// =================== Categories ===================
const CATEGORIES = [
  { id: "all",         name: "All",           ico: "✨" },
  { id: "electronics", name: "Electronics",   ico: "📱" },
  { id: "furniture",   name: "Furniture",     ico: "🛋️" },
  { id: "vehicles",    name: "Vehicles",      ico: "🚗" },
  { id: "clothing",    name: "Clothing",      ico: "👕" },
  { id: "home",        name: "Home",          ico: "🏡" },
  { id: "sports",      name: "Sports",        ico: "🏀" },
  { id: "toys",        name: "Toys",          ico: "🧸" },
  { id: "books",       name: "Books",         ico: "📚" },
  { id: "tools",       name: "Tools",         ico: "🔧" },
  { id: "music",       name: "Music",         ico: "🎸" },
  { id: "free",        name: "Free",          ico: "🎁" },
];

// =================== Listings ===================
function makeListings() {
  const items = [
    ["IKEA Kallax 4x4 shelf", 80, "furniture", "Like new", "Great condition. Light scratches on top.", 0],
    ["iPhone 14 Pro 256GB",   650, "electronics", "Good", "Unlocked, battery 91%, no cracks.", 0],
    ["Trek Marlin 6 mountain bike", 320, "sports", "Good", "Size M frame, recent tune-up.", 1],
    ["Toddler stroller (Joovy)", 60, "toys", "Good", "Folds flat. Cup holder included.", 0],
    ["DeWalt 20V drill kit", 110, "tools", "Like new", "Two batteries + charger + bag.", 0],
    ["Vintage Yamaha acoustic guitar", 220, "music", "Good", "Beautiful tone, includes soft case.", 1],
    ["Patio set (table + 4 chairs)", 140, "home", "Fair", "Powder-coated steel. Some sun fade.", 0],
    ["Macbook Air M2 13\"", 780, "electronics", "Like new", "8GB / 256GB. Box + charger.", 0],
    ["Vintage Levi's denim jacket", 45, "clothing", "Good", "Size L. Fits true to size.", 0],
    ["Mid-century coffee table", 95, "furniture", "Good", "Solid walnut. 48\" wide.", 0],
    ["Free moving boxes (~25)", 0, "free", "Used", "Various sizes. Pickup only.", 0],
    ["Peloton Bike+", 1200, "sports", "Like new", "Original mat + shoes (size 9).", 0],
    ["LEGO Star Wars Razor Crest set", 90, "toys", "New", "Sealed. Set 75292.", 0],
    ["Sony WH-1000XM4 headphones", 140, "electronics", "Like new", "Original case + cable.", 0],
    ["Toyota Tacoma 2016 SR5", 21500, "vehicles", "Good", "108k miles. Recent service.", 0],
    ["Garden hose 100 ft + reel", 30, "home", "Good", "No leaks. Brass fittings.", 0],
    ["Cookbook: Salt Fat Acid Heat", 12, "books", "Like new", "Hardcover, signed.", 0],
    ["Fender Mustang amp", 95, "music", "Good", "25W. Footswitch included.", 0],
    ["Adidas Ultraboost 22 (size 10)", 60, "clothing", "Good", "Black. Maybe 30 miles on them.", 0],
    ["Snap-on socket set", 280, "tools", "Like new", "1/4\" + 3/8\" drives. Hard case.", 0],
    ["Free houseplant cuttings", 0, "free", "—", "Pothos, philodendron, monstera.", 0],
    ["Apple Watch Series 9 45mm", 320, "electronics", "Like new", "GPS, midnight aluminum.", 0],
    ["Stand-up paddleboard inflatable", 240, "sports", "Good", "10'6\" with pump and paddle.", 0],
    ["Antique writing desk", 180, "furniture", "Fair", "Real oak. Some wear, very sturdy.", 0],
    ["Toaster oven (Breville)", 75, "home", "Good", "Smart oven air. Works perfectly.", 0],
    ["Pokémon TCG sealed booster box", 130, "toys", "New", "Scarlet & Violet 151.", 0],
    ["Carhartt work jacket", 55, "clothing", "Good", "Tan, size XL. Heavy duty.", 0],
    ["Stack of mystery novels (12)", 18, "books", "Good", "Stephen King, Agatha Christie.", 0],
    ["Bose SoundLink Mini 2", 70, "electronics", "Good", "Battery still strong.", 0],
    ["Mid-century brass lamp", 40, "home", "Good", "Brass + linen shade.", 0],
  ];
  return items.map((it, i) => {
    const id = i + 1;
    return {
      id,
      title: it[0],
      price: it[1],
      cat: it[2],
      cond: it[3],
      desc: it[4],
      photos: [
        `https://picsum.photos/seed/mkt${id}a/800/800`,
        `https://picsum.photos/seed/mkt${id}b/800/800`,
        `https://picsum.photos/seed/mkt${id}c/800/800`,
        `https://picsum.photos/seed/mkt${id}d/800/800`
      ],
      thumb: `https://picsum.photos/seed/mkt${id}a/600/600`,
      miles: ((id * 7) % 12) + 1,
      postedDays: (id * 3) % 14,
      seller: ["Alex", "Jamie", "Sam", "Casey", "Riley", "Jordan"][i % 6],
      rating: (4.4 + ((i * 0.07) % 0.6)).toFixed(1)
    };
  });
}
const LISTINGS = makeListings();

// =================== Mock conversations ===================
const CONVS = [
  { listingId: 8,  name: "Riley", last: "Still available? Could pick up tonight.", when: "2m",  unread: true },
  { listingId: 14, name: "Sam",   last: "Would you take $620?",                   when: "1h",  unread: true },
  { listingId: 3,  name: "Casey", last: "Sounds good — see you at 6.",            when: "5h",  unread: false },
  { listingId: 22, name: "Jamie", last: "Thanks for the deal!",                   when: "1d",  unread: false },
  { listingId: 12, name: "Alex",  last: "Is the price firm?",                     when: "3d",  unread: false },
];

// =================== State ===================
const state = {
  view: "home",
  category: "all",
  query: "",
  zip: null,
  zips: null,
  saved: new Set(),
  recents: ["bike", "iphone", "lego", "guitar"],
  sort: "newest",
  priceFilter: "all"
};

// =================== Helpers ===================
const $  = (q, r = document) => r.querySelector(q);
const $$ = (q, r = document) => Array.from(r.querySelectorAll(q));

function priceLabel(p) {
  if (p === 0) return "Free";
  return "$" + p.toLocaleString();
}
function postedLabel(d) {
  if (d === 0) return "today";
  if (d === 1) return "1d ago";
  if (d < 7) return d + "d ago";
  return Math.floor(d / 7) + "w ago";
}

// =================== Filtering / sorting ===================
function applyFilters(list) {
  let out = list;
  if (state.category !== "all") out = out.filter(it => it.cat === state.category);
  if (state.query) {
    const q = state.query.toLowerCase();
    out = out.filter(it => it.title.toLowerCase().includes(q) || it.desc.toLowerCase().includes(q));
  }
  if (state.priceFilter === "free") out = out.filter(it => it.price === 0);
  else if (state.priceFilter !== "all") {
    const cap = parseInt(state.priceFilter, 10);
    out = out.filter(it => it.price <= cap);
  }
  switch (state.sort) {
    case "price-asc":  out = [...out].sort((a, b) => a.price - b.price); break;
    case "price-desc": out = [...out].sort((a, b) => b.price - a.price); break;
    case "distance":   out = [...out].sort((a, b) => a.miles - b.miles); break;
    default:           out = [...out].sort((a, b) => a.postedDays - b.postedDays);
  }
  return out;
}

// =================== Card renderer ===================
function cardHtml(it, withHeart = true) {
  const heartOn = state.saved.has(it.id);
  return `
    <div class="card" data-id="${it.id}">
      <div class="thumb" style="background-image:url(${it.thumb})"></div>
      ${withHeart ? `<button class="heart ${heartOn ? "on" : ""}" data-heart="${it.id}" aria-label="Save">${heartOn ? "♥" : "♡"}</button>` : ""}
      <div class="info">
        <div class="price">${priceLabel(it.price)}</div>
        <div class="title">${it.title}</div>
        <div class="meta">${it.miles} mi · ${postedLabel(it.postedDays)}</div>
      </div>
    </div>`;
}

function bindCards(container) {
  container.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", e => {
      if (e.target.closest("[data-heart]")) return;
      const id = parseInt(card.dataset.id, 10);
      const it = LISTINGS.find(l => l.id === id);
      if (it) openDetail(it);
    });
  });
  container.querySelectorAll("[data-heart]").forEach(b => {
    b.addEventListener("click", e => {
      e.stopPropagation();
      const id = parseInt(b.dataset.heart, 10);
      toggleHeart(id);
    });
  });
}

// =================== Categories ===================
function renderHomeCats() {
  const el = $("#catGrid");
  el.innerHTML = CATEGORIES.map(c =>
    `<button class="cat-tile ${c.id === state.category ? "active" : ""}" data-cat="${c.id}">
       <span class="ico">${c.ico}</span>
       <span class="nm">${c.name}</span>
     </button>`).join("");
  el.querySelectorAll("[data-cat]").forEach(b => {
    b.addEventListener("click", () => {
      state.category = b.dataset.cat;
      renderHomeCats();
      renderListings();
    });
  });

  const sel = $("#postCategory");
  if (sel && sel.children.length === 0) {
    for (const c of CATEGORIES.slice(1)) {
      const o = document.createElement("option");
      o.value = c.id; o.textContent = c.name;
      sel.appendChild(o);
    }
  }
}

function renderTrending() {
  const el = $("#trendingGrid");
  if (!el) return;
  const top = CATEGORIES.slice(1, 7);
  el.innerHTML = top.map(c =>
    `<button class="cat-tile" data-tcat="${c.id}">
       <span class="ico">${c.ico}</span>
       <span class="nm">${c.name}</span>
     </button>`).join("");
  el.querySelectorAll("[data-tcat]").forEach(b => {
    b.addEventListener("click", () => {
      state.category = b.dataset.tcat;
      go("home");
      renderHomeCats();
      renderListings();
    });
  });
}

// =================== Listings grid ===================
function renderListings() {
  const el = $("#grid");
  const filtered = applyFilters(LISTINGS);
  if (filtered.length === 0) {
    el.innerHTML = `<div class="empty">No items match your filters.</div>`;
    return;
  }
  el.innerHTML = filtered.map(it => cardHtml(it)).join("");
  bindCards(el);
}

function renderSaved() {
  const el = $("#savedGrid");
  if (!el) return;
  const saved = LISTINGS.filter(l => state.saved.has(l.id));
  if (saved.length === 0) {
    el.innerHTML = `<div class="empty">No saved items yet. Tap ♡ on any listing to save it.</div>`;
  } else {
    el.innerHTML = saved.map(it => cardHtml(it)).join("");
    bindCards(el);
  }
  $("#savedCount").textContent = String(state.saved.size);
}

function renderMy() {
  const el = $("#myListings");
  if (!el) return;
  const mine = LISTINGS.slice(0, 4);
  el.innerHTML = mine.map(it => cardHtml(it, false)).join("");
  bindCards(el);
}

function toggleHeart(id) {
  if (state.saved.has(id)) state.saved.delete(id); else state.saved.add(id);
  renderListings();
  renderSaved();
  renderSearchResults();
  $("#savedCount").textContent = String(state.saved.size);
  if (state.view === "detail") {
    const heart = $("#detailHeart");
    if (heart) {
      const on = state.saved.has(id);
      heart.textContent = on ? "♥" : "♡";
      heart.classList.toggle("saved", on);
    }
  }
}

// =================== Detail ===================
let currentDetailId = null;
function openDetail(it) {
  currentDetailId = it.id;
  const slides = it.photos.map(src => `<div class="slide" style="background-image:url(${src})"></div>`).join("");
  const dots = it.photos.map((_, i) => `<span class="dot ${i === 0 ? "active" : ""}"></span>`).join("");
  const where = state.zip ? `${state.zip.city}, ${state.zip.state}` : "Nearby";

  $("#detailScroll").innerHTML = `
    <div class="gallery" id="gallery">${slides}</div>
    <div class="dots" id="dots">${dots}</div>
    <div class="detail-body">
      <div class="detail-price">${priceLabel(it.price)}</div>
      <div class="detail-title">${it.title}</div>
      <div class="detail-meta">📍 ${where} · ${it.miles} mi · posted ${postedLabel(it.postedDays)}</div>

      <div class="detail-section">
        <h4>Condition</h4>
        <p>${it.cond}</p>
      </div>
      <div class="detail-section">
        <h4>Description</h4>
        <p>${it.desc}</p>
      </div>
      <div class="seller">
        <div class="avatar">${it.seller[0]}</div>
        <div class="who"><b>${it.seller}</b><span>★ ${it.rating} · responds in ~1 hour</span></div>
      </div>
    </div>
  `;

  const heart = $("#detailHeart");
  const on = state.saved.has(it.id);
  heart.textContent = on ? "♥" : "♡";
  heart.classList.toggle("saved", on);
  heart.onclick = () => toggleHeart(it.id);

  const gallery = $("#gallery");
  const dotEls = $$("#dots .dot");
  gallery.addEventListener("scroll", () => {
    const idx = Math.round(gallery.scrollLeft / gallery.clientWidth);
    dotEls.forEach((d, i) => d.classList.toggle("active", i === idx));
  });

  go("detail");
}

// =================== Search view ===================
function renderRecents() {
  const el = $("#recentRow");
  if (!el) return;
  el.innerHTML = state.recents.map(r => `<button class="recent" data-recent="${r}">${r}</button>`).join("");
  el.querySelectorAll("[data-recent]").forEach(b => {
    b.addEventListener("click", () => {
      $("#searchInput").value = b.dataset.recent;
      runSearch(b.dataset.recent);
    });
  });
}

function renderSearchResults() {
  const el = $("#searchResults");
  if (!el) return;
  if (!state.query) {
    el.innerHTML = "";
    $("#resultsHead").hidden = true;
    return;
  }
  const filtered = applyFilters(LISTINGS);
  $("#resultsHead").hidden = false;
  if (filtered.length === 0) {
    el.innerHTML = `<div class="empty">No items match "${state.query}".</div>`;
  } else {
    el.innerHTML = filtered.map(it => cardHtml(it)).join("");
    bindCards(el);
  }
}

function runSearch(q) {
  state.query = q.trim();
  $("#clearSearch").hidden = !state.query;
  renderSearchResults();
  if (state.query && !state.recents.includes(state.query)) {
    state.recents.unshift(state.query);
    state.recents = state.recents.slice(0, 6);
    renderRecents();
  }
}

// =================== Inbox ===================
function renderConvs() {
  const el = $("#convList");
  if (!el) return;
  el.innerHTML = CONVS.map(c => {
    const it = LISTINGS.find(l => l.id === c.listingId);
    if (!it) return "";
    return `
      <li class="conv ${c.unread ? "unread" : ""}" data-conv-item="${it.id}">
        <div class="ph" style="background-image:url(${it.thumb})"></div>
        <div class="body">
          <div class="head"><b>${c.name}</b><span class="when">${c.when}</span></div>
          <div class="item">${it.title}</div>
          <div class="last">${c.last}</div>
        </div>
      </li>`;
  }).join("");
  el.querySelectorAll("[data-conv-item]").forEach(li => {
    li.addEventListener("click", () => {
      const id = parseInt(li.dataset.convItem, 10);
      const it = LISTINGS.find(l => l.id === id);
      if (it) openDetail(it);
    });
  });
}

// =================== View routing ===================
const viewStack = ["home"];
function go(view) {
  if (view !== state.view) viewStack.push(view);
  state.view = view;
  $$(".view").forEach(v => v.hidden = v.dataset.view !== view);
  $$(".tab").forEach(t => t.classList.toggle("active", t.dataset.go === view));
  if (view === "search") setTimeout(() => $("#searchInput").focus(), 80);
  if (view === "saved") renderSaved();
}

document.addEventListener("click", (e) => {
  const back = e.target.closest("[data-back]");
  if (back) {
    viewStack.pop();
    const prev = viewStack[viewStack.length - 1] || "home";
    go(prev);
    return;
  }
  const dest = e.target.closest("[data-go]");
  if (dest) {
    go(dest.dataset.go);
    return;
  }
});

// =================== Filter row toggle ===================
$("[data-show-filters]").addEventListener("click", () => {
  const row = $("#filterRow");
  row.hidden = !row.hidden;
});

$("#sortSel").addEventListener("change", e => {
  state.sort = e.target.value;
  renderListings();
});

document.querySelectorAll("[data-price]").forEach(b => {
  if (b.dataset.price === state.priceFilter) b.classList.add("active");
  b.addEventListener("click", () => {
    state.priceFilter = b.dataset.price;
    document.querySelectorAll("[data-price]").forEach(x => x.classList.toggle("active", x === b));
    renderListings();
  });
});

// =================== Search input ===================
$("#searchInput").addEventListener("input", e => runSearch(e.target.value));
$("#clearSearch").addEventListener("click", () => {
  $("#searchInput").value = "";
  $("#clearSearch").hidden = true;
  runSearch("");
});

// =================== ZIP picker ===================
async function loadZips() {
  if (state.zips) return state.zips;
  const res = await fetch("data/us_zips.json");
  const raw = await res.json();
  state.zips = raw.map(r => ({ zip: r[0], city: r[1], state: r[2], county: r[3], lat: r[4], lng: r[5] }));
  return state.zips;
}

const zipModal  = $("#zipModal");
const zipList   = $("#zipList");
const zipSearch = $("#zipSearch");

$("#locChip").onclick = async () => {
  zipModal.hidden = false;
  zipSearch.value = "";
  zipSearch.focus();
  const zips = await loadZips();
  renderZipList(zips.slice(0, 50));
};
$("#zipClose").onclick = () => zipModal.hidden = true;

function renderZipList(items) {
  if (items.length === 0) {
    zipList.innerHTML = `<li class="empty">No matches.</li>`;
    return;
  }
  zipList.innerHTML = items.slice(0, 200).map(z =>
    `<li data-zip="${z.zip}" data-city="${z.city}" data-state="${z.state}">
       <span class="city">${z.city}, ${z.state}</span>
       <span class="zip-code">${z.zip}</span>
     </li>`).join("");
}

zipList.addEventListener("click", e => {
  const li = e.target.closest("li");
  if (!li || !li.dataset.zip) return;
  state.zip = { zip: li.dataset.zip, city: li.dataset.city, state: li.dataset.state };
  $("#locLabel").textContent = `${state.zip.city}, ${state.zip.state}  ${state.zip.zip}`;
  zipModal.hidden = true;
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
      if (z.zip.startsWith(q) ||
          z.city.toLowerCase().startsWith(q) ||
          z.state.toLowerCase() === q ||
          (z.city + ", " + z.state).toLowerCase().includes(q)) {
        matches.push(z);
        if (matches.length >= 200) break;
      }
    }
    renderZipList(matches);
  }, 80);
});

// =================== Boot ===================
renderHomeCats();
renderTrending();
renderRecents();
renderListings();
renderSaved();
renderMy();
renderConvs();
go("home");
