// =================== Categories ===================
const CATEGORIES = [
  { id: "all",       name: "All",            ico: "✨" },
  { id: "electronics", name: "Electronics",  ico: "📱" },
  { id: "furniture",   name: "Furniture",    ico: "🛋️" },
  { id: "vehicles",    name: "Vehicles",     ico: "🚗" },
  { id: "clothing",    name: "Clothing",     ico: "👕" },
  { id: "home",        name: "Home & Garden", ico: "🏡" },
  { id: "sports",      name: "Sports",       ico: "🏀" },
  { id: "toys",        name: "Toys & Games", ico: "🧸" },
  { id: "books",       name: "Books",        ico: "📚" },
  { id: "tools",       name: "Tools",        ico: "🔧" },
  { id: "music",       name: "Music",        ico: "🎸" },
  { id: "free",        name: "Free stuff",   ico: "🎁" },
  { id: "other",       name: "Other",        ico: "📦" },
];

// =================== Sample listings ===================
function makeListings() {
  const items = [
    ["IKEA Kallax 4x4 shelf", 80, "furniture", "Like new", "Great condition. Light scratches on top."],
    ["iPhone 14 Pro 256GB",   650, "electronics", "Good", "Unlocked, battery 91%, no cracks."],
    ["Trek Marlin 6 mountain bike", 320, "sports", "Good", "Size M frame, recent tune-up."],
    ["Toddler stroller (Joovy)", 60, "toys", "Good", "Folds flat. Cup holder included."],
    ["DeWalt 20V drill kit", 110, "tools", "Like new", "Two batteries + charger + bag."],
    ["Vintage Yamaha acoustic guitar", 220, "music", "Good", "Beautiful tone, includes soft case."],
    ["Patio set (table + 4 chairs)", 140, "home", "Fair", "Powder-coated steel. Some sun fade."],
    ["Macbook Air M2 13\"", 780, "electronics", "Like new", "8GB / 256GB. Box + charger."],
    ["Vintage Levi's denim jacket", 45, "clothing", "Good", "Size L. Fits true to size."],
    ["Mid-century coffee table", 95, "furniture", "Good", "Solid walnut. 48\" wide."],
    ["Free moving boxes (~25)",  0, "free", "Used", "Various sizes. Pickup only."],
    ["Peloton Bike+", 1200, "sports", "Like new", "Original mat + shoes (size 9)."],
    ["LEGO Star Wars Razor Crest set", 90, "toys", "New", "Sealed. Set 75292."],
    ["Sony WH-1000XM4 headphones", 140, "electronics", "Like new", "Original case + cable."],
    ["Toyota Tacoma 2016 SR5", 21500, "vehicles", "Good", "108k miles. Recent service."],
    ["Garden hose 100 ft + reel", 30, "home", "Good", "No leaks. Brass fittings."],
    ["Cookbook: Salt Fat Acid Heat", 12, "books", "Like new", "Hardcover, signed."],
    ["Fender Mustang amp", 95, "music", "Good", "25W. Footswitch included."],
    ["Adidas Ultraboost 22 (size 10)", 60, "clothing", "Good", "Black. Maybe 30 miles on them."],
    ["Snap-on socket set", 280, "tools", "Like new", "1/4\" + 3/8\" drives. Hard case."],
    ["Free houseplant cuttings", 0, "free", "—", "Pothos, philodendron, monstera."],
    ["Apple Watch Series 9 45mm", 320, "electronics", "Like new", "GPS, midnight aluminum."],
    ["Stand-up paddleboard inflatable", 240, "sports", "Good", "10'6\" with pump and paddle."],
    ["Antique writing desk", 180, "furniture", "Fair", "Real oak. Some wear, very sturdy."],
    ["Toaster oven (Breville)", 75, "home", "Good", "Smart oven air. Works perfectly."],
    ["Pokémon TCG sealed booster box", 130, "toys", "New", "Scarlet & Violet 151."],
    ["Carhartt work jacket", 55, "clothing", "Good", "Tan, size XL. Heavy duty."],
    ["Stack of mystery novels (12)", 18, "books", "Good", "Stephen King, Agatha Christie."],
    ["Bose SoundLink Mini 2", 70, "electronics", "Good", "Battery still strong."],
    ["Mid-century lamp", 40, "home", "Good", "Brass + linen shade."],
  ];
  return items.map((it, i) => ({
    id: i + 1,
    title: it[0],
    price: it[1],
    cat: it[2],
    cond: it[3],
    desc: it[4],
    img: `https://picsum.photos/seed/mkt${i + 1}/600/600`,
    miles: Math.floor(Math.random() * 12) + 1,
    posted: ["2h", "1d", "3d", "5d", "1w"][i % 5],
    seller: ["Alex", "Jamie", "Sam", "Casey", "Riley", "Jordan"][i % 6],
    rating: (4 + Math.random()).toFixed(1)
  }));
}

const LISTINGS = makeListings();

// =================== State ===================
const state = {
  view: "browse",
  category: "all",
  query: "",
  zip: null,
  zips: null
};

// =================== Helpers ===================
const $  = (q, r = document) => r.querySelector(q);
const $$ = (q, r = document) => Array.from(r.querySelectorAll(q));

function priceLabel(p) {
  if (p === 0) return "Free";
  return "$" + p.toLocaleString();
}

// =================== Render: categories ===================
function renderCats() {
  const rail = $("#catRail");
  rail.innerHTML = "";
  for (const c of CATEGORIES) {
    const b = document.createElement("button");
    b.className = "cat" + (c.id === state.category ? " active" : "");
    b.innerHTML = `<span class="ico">${c.ico}</span> ${c.name}`;
    b.onclick = () => { state.category = c.id; renderCats(); renderGrid(); };
    rail.appendChild(b);
  }

  const sel = $("#postCategory");
  if (sel && sel.children.length === 0) {
    for (const c of CATEGORIES.slice(1)) {
      const o = document.createElement("option");
      o.value = c.id; o.textContent = c.name;
      sel.appendChild(o);
    }
  }
}

// =================== Render: grid ===================
function renderGrid(target = "#grid", source = LISTINGS) {
  const el = $(target);
  el.innerHTML = "";
  const filtered = source.filter(it => {
    if (state.category !== "all" && it.cat !== state.category) return false;
    if (state.query) {
      const q = state.query.toLowerCase();
      if (!it.title.toLowerCase().includes(q) && !it.desc.toLowerCase().includes(q)) return false;
    }
    return true;
  });
  if (filtered.length === 0) {
    el.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:40px 0; color:var(--muted)">No items match.</div>`;
    return;
  }
  for (const it of filtered) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="thumb" style="background-image:url(${it.img})"></div>
      <div class="info">
        <div class="price">${priceLabel(it.price)}</div>
        <div class="title">${it.title}</div>
        <div class="meta">${it.miles} mi · ${it.posted}</div>
      </div>`;
    card.onclick = () => openDetail(it);
    el.appendChild(card);
  }
}

// =================== Render: detail ===================
function openDetail(it) {
  const s = $("#detailScroll");
  s.innerHTML = `
    <div class="detail-hero" style="background-image:url(${it.img})"></div>
    <div class="detail-body">
      <div class="detail-price">${priceLabel(it.price)}</div>
      <div class="detail-title">${it.title}</div>
      <div class="detail-meta">📍 ${state.zip ? state.zip.city + ", " + state.zip.state : "Nearby"} · ${it.miles} mi · ${it.posted} ago</div>

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
  go("detail");
}

// =================== View routing ===================
function go(view) {
  state.view = view;
  $$(".view").forEach(v => v.hidden = v.dataset.view !== view);
  $$(".tab").forEach(t => t.classList.toggle("active", t.dataset.go === view));
}

document.addEventListener("click", (e) => {
  const back = e.target.closest("[data-back]");
  if (back) { go("browse"); return; }
  const tab = e.target.closest(".tab");
  if (tab && tab.dataset.go) {
    go(tab.dataset.go);
    if (tab.dataset.focusSearch) setTimeout(() => $("#searchInput").focus(), 50);
  }
});

// =================== Search ===================
$("#searchInput").addEventListener("input", e => {
  state.query = e.target.value.trim();
  renderGrid();
});

// =================== ZIP picker ===================
async function loadZips() {
  if (state.zips) return state.zips;
  const res = await fetch("data/us_zips.json");
  const raw = await res.json();
  state.zips = raw.map(r => ({ zip: r[0], city: r[1], state: r[2], county: r[3], lat: r[4], lng: r[5] }));
  return state.zips;
}

const zipModal = $("#zipModal");
const zipList  = $("#zipList");
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

// =================== My listings (profile) ===================
function renderMy() {
  const el = $("#myListings");
  if (!el) return;
  const mine = LISTINGS.slice(0, 4);
  el.innerHTML = mine.map(it => `
    <div class="card">
      <div class="thumb" style="background-image:url(${it.img})"></div>
      <div class="info">
        <div class="price">${priceLabel(it.price)}</div>
        <div class="title">${it.title}</div>
        <div class="meta">${it.miles} mi · ${it.posted}</div>
      </div>
    </div>`).join("");
}

// =================== Boot ===================
renderCats();
renderGrid();
renderMy();
go("browse");
