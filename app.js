/* ============ EDIT THESE ============ */
const CONFIG = {
  shop: "SR Immitation",
  whatsapp: "919352997139",          // country code + number, no + or spaces
  insta: "sr.jewellery_collection01",
  sheetCsv: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQshPd9-vDV9wNVUqZL1pmH_YQZxmKiQPFLelnNCh0vduZKt5GoXYgB9B0PLJVXtasqxGrsJ0JinlQF/pub?gid=1355667062&single=true&output=csv"                       // paste the Google Sheet "published CSV" link here (see SETUP.md)
};
/* Sheet columns: name, price, category, image, stock, description */
const SAMPLE = [
  {name:"Kundan Jhumka Earrings",price:350,category:"Earrings",image:"",stock:"yes",description:"Gold-tone kundan with pearl drops"},
  {name:"Oxidised Choker Necklace",price:499,category:"Necklaces",image:"",stock:"yes",description:"Antique silver finish, adjustable cord"},
  {name:"Bridal Bangle Set (4 pcs)",price:650,category:"Bangles",image:"",stock:"yes",description:"Stone-studded, sizes 2.4 and 2.6"},
  {name:"Temple Necklace Set",price:899,category:"Sets",image:"",stock:"no",description:"Necklace with matching earrings"}
];
/* ==================================== */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rupee = n => "₹" + Number(n || 0).toLocaleString("en-IN");
const wa = t => "https://wa.me/" + CONFIG.whatsapp + (t ? "?text=" + encodeURIComponent(t) : "");
let products = [], cart = {}, cat = new URLSearchParams(location.search).get("cat") || "All";

function parseCSV(t){
  const rows = []; let r = [], c = "", q = false;
  for (let i = 0; i < t.length; i++){
    const ch = t[i];
    if (q){ if (ch === '"'){ if (t[i+1] === '"'){ c += '"'; i++; } else q = false; } else c += ch; }
    else if (ch === '"') q = true;
    else if (ch === ","){ r.push(c); c = ""; }
    else if (ch === "\n" || ch === "\r"){ if (ch === "\r" && t[i+1] === "\n") i++; r.push(c); rows.push(r); r = []; c = ""; }
    else c += ch;
  }
  if (c || r.length){ r.push(c); rows.push(r); }
  return rows;
}
function fromCSV(t){
  const rows = parseCSV(t).filter(r => r.some(x => x.trim()));
  const raw = rows.shift().map(h => h.trim().toLowerCase());
  const key = h => /image|photo|picture|upload|pic/.test(h) ? "image" : /price|cost|rate|mrp/.test(h) ? "price"
    : /categor|type/.test(h) ? "category" : /stock|avail/.test(h) ? "stock" : /desc|detail/.test(h) ? "description"
    : /name|title|product/.test(h) ? "name" : h;
  const head = raw.map(key);
  const list = rows.map(r => { const o = {}; head.forEach((h, i) => { if (!o[h]) o[h] = (r[i] || "").trim(); }); return o; }).filter(p => p.name);
  return {list, raw};
}
function imgUrl(u){
  u = (u || "").split(",")[0].trim(); if (!u) return "";
  if (!u.includes("drive.google.com")) return u;
  const m = u.match(/\/d\/([\w-]+)/) || u.match(/[?&]id=([\w-]+)/);
  return m ? "https://drive.google.com/thumbnail?id=" + m[1] + "&sz=w900" : u;
}
const inStock = p => !/^(no|n|out|0|false|sold)/i.test(p.stock || "yes");

async function load(){
  let list = SAMPLE, fromSheet = false;
  if (CONFIG.sheetCsv){
    try {
      const r = await fetch(CONFIG.sheetCsv); if (!r.ok) throw new Error("HTTP " + r.status);
      const txt = await r.text();
      if (/^\s*<(!doctype|html)/i.test(txt)) throw new Error("not-csv");
      const out = fromCSV(txt); list = out.list.reverse(); fromSheet = true;
      if (!list.length){ $("#grid").innerHTML = '<p class="msg">No products yet. Add one with your product form.<br><small>Columns found in the sheet: ' + esc(out.raw.join(", ")) + '. A column for the product name is needed.</small></p>'; return; }
    } catch(e){
      console.error("Sheet load failed:", e);
      const hint = e.message === "not-csv" ? "The sheet link opens a web page, not CSV. Publish the sheet again as CSV." : "Check the sheet link in app.js.";
      $("#grid").innerHTML = '<p class="msg">We could not load the collection right now. Please message us on WhatsApp.<br><small>(Owner: ' + hint + ')</small></p>'; return;
    }
  }
  products = list.map((p, i) => ({...p, id: i, rank: i, price: parseFloat(String(p.price).replace(/[^\d.]/g, "")) || 0,
    category: p.category || "Other", isNew: fromSheet && i < 6 && list.length > 6}));
  const qp = new URLSearchParams(location.search).get("q"); if (qp && $("#q")) $("#q").value = qp;
  chips(); tiles(); render();
}
function tiles(){
  const t = $("#cats"); if (!t) return;
  t.innerHTML = [...new Set(products.map(p => p.category))].map(c => `<a class="tile" href="shop.html?cat=${encodeURIComponent(c)}"><img src="images/cat-${c.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg" alt="" onerror="this.remove()"><span>${esc(c)}</span><small>${products.filter(p => p.category === c).length} pieces</small></a>`).join("");
}
function chips(){
  if (!$("#chips")) return;
  const cats = ["All", ...new Set(products.map(p => p.category))];
  $("#chips").innerHTML = cats.map(c => `<button class="chip" aria-pressed="${c === cat}" data-c="${esc(c)}">${esc(c)}</button>`).join("");
}
if ($("#chips")) $("#chips").onclick = e => { const b = e.target.closest(".chip"); if (b){ cat = b.dataset.c; chips(); render(); } };
if ($("#q")){ $("#q").oninput = render; $("#sort").onchange = render; }

function render(){
  const q = $("#q") ? $("#q").value.trim().toLowerCase() : "", s = $("#sort") ? $("#sort").value : "new";
  let l = products.filter(p => (cat === "All" || p.category === cat) && (!q || (p.name + " " + p.description + " " + p.category).toLowerCase().includes(q)));
  l.sort((a, b) => s === "lo" ? a.price - b.price : s === "hi" ? b.price - a.price : a.rank - b.rank);
  const lim = +($("#grid").dataset.limit || 0); if (lim) l = l.slice(0, lim);
  if (!l.length){ $("#grid").innerHTML = '<p class="msg">Nothing matches yet. Try another category or message us on WhatsApp.</p>'; return; }
  $("#grid").innerHTML = l.map(p => { const ok = inStock(p), im = imgUrl(p.image);
    return `<article class="card"><div class="ph" data-open="${p.id}">${im ? `<img src="${esc(im)}" alt="${esc(p.name)}" loading="lazy" onerror="this.remove()">` : ""}${!ok ? '<span class="tag out">Sold out</span>' : p.isNew ? '<span class="tag">New</span>' : ""}</div>
    <div class="info"><h3>${esc(p.name)}</h3><small>${esc(p.category)}</small><span class="price">${rupee(p.price)}</span>
    <div class="acts"><button class="add" data-add="${p.id}" ${ok ? "" : "disabled"}>Add to cart</button><button class="ord" data-ord="${p.id}" ${ok ? "" : "disabled"}>Order</button></div></div></article>`; }).join("");
}
$("#grid").onclick = e => {
  const t = e.target;
  if (t.dataset.add) add(+t.dataset.add);
  else if (t.dataset.ord) order(+t.dataset.ord);
  else { const o = t.closest("[data-open]"); if (o) openDetail(+o.dataset.open); }
};
const order = id => { const p = products[id]; window.open(wa(`Hi ${CONFIG.shop}, I would like to order:\n1 × ${p.name} (${rupee(p.price)})`), "_blank"); };
function openDetail(id){
  const p = products[id], ok = inStock(p), im = imgUrl(p.image);
  $("#dIn").innerHTML = `<div class="ph">${im ? `<img src="${esc(im)}" alt="${esc(p.name)}" onerror="this.remove()">` : ""}</div>
  <div class="d-txt"><small>${esc(p.category)}</small><h3>${esc(p.name)}</h3><span class="price" style="font-size:1.4rem">${rupee(p.price)}</span>
  <p style="color:var(--mut)">${esc(p.description) || "Imitation jewellery. Message us for more photos."}</p>
  <div class="acts"><button class="add" data-add="${p.id}" ${ok ? "" : "disabled"}>${ok ? "Add to cart" : "Sold out"}</button><button class="ord" data-ord="${p.id}" ${ok ? "" : "disabled"}>Order on WhatsApp</button></div></div>`;
  $("#detail").showModal();
}
$("#dIn").onclick = e => { if (e.target.dataset.add){ add(+e.target.dataset.add); $("#detail").close(); } else if (e.target.dataset.ord) order(+e.target.dataset.ord); };

const count = () => Object.values(cart).reduce((a, b) => a + b, 0);
const save = () => { try { const o = {}; Object.entries(cart).forEach(([i, q]) => { if (products[i]) o[products[i].name] = q; }); localStorage.setItem("sr_cart", JSON.stringify(o)); } catch(e){} };
function toast(t){ const x = $("#toast"); x.textContent = t; x.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => x.classList.remove("on"), 1600); }
function add(id){ cart[id] = (cart[id] || 0) + 1; save(); draw(); toast("Added to cart"); }
function draw(){
  $("#count").textContent = count();
  const ids = Object.keys(cart).filter(i => products[i]);
  $("#checkout").hidden = !ids.length;
  if (!ids.length){ $("#lines").innerHTML = '<p class="msg" style="padding:30px 0">Your cart is empty. Add a piece you love.</p>'; return; }
  $("#lines").innerHTML = ids.map(i => `<div class="li"><div><strong>${esc(products[i].name)}</strong><br><small>${rupee(products[i].price)}</small></div>
    <div class="qty"><button data-m="${i}" aria-label="Remove one">−</button><span>${cart[i]}</span><button data-p="${i}" aria-label="Add one">+</button></div></div>`).join("");
  $("#total").textContent = rupee(ids.reduce((s, i) => s + products[i].price * cart[i], 0));
}
$("#lines").onclick = e => {
  const m = e.target.dataset.m, p = e.target.dataset.p;
  if (m !== undefined && --cart[m] <= 0) delete cart[m];
  if (p !== undefined) cart[p]++;
  save(); draw();
};
$("#openCart").onclick = () => { draw(); $("#drawer").showModal(); };
$("#closeCart").onclick = () => $("#drawer").close();
$("#send").onclick = () => {
  const ids = Object.keys(cart).filter(i => products[i]); if (!ids.length) return;
  const lines = ids.map(i => `${cart[i]} × ${products[i].name} (${rupee(products[i].price * cart[i])})`).join("\n");
  const total = rupee(ids.reduce((s, i) => s + products[i].price * cart[i], 0));
  window.open(wa(`Hi ${CONFIG.shop}, I would like to order:\n${lines}\n\nTotal: ${total}\nName: ${$("#cName").value.trim() || "-"}\nAddress: ${$("#cAddr").value.trim() || "-"}`), "_blank");
};

const ig = "https://www.instagram.com/" + CONFIG.insta + "/";
["#igTop", "#igHero", "#igFoot", "#igBand"].forEach(s => { if ($(s)) $(s).href = ig; });
document.querySelectorAll(".igl").forEach(a => a.href = ig);
document.querySelectorAll("[data-wa]").forEach(a => { a.href = wa("Hi " + CONFIG.shop + ", I am looking for " + a.dataset.wa + "."); a.target = "_blank"; a.rel = "noopener"; });
$("#igFoot").textContent = "@" + CONFIG.insta;
$("#waFab").href = wa("Hi " + CONFIG.shop + ", I have a question.");
$("#waFoot").href = wa(""); $("#waFoot").textContent = "+91 " + CONFIG.whatsapp.slice(2, 7) + " " + CONFIG.whatsapp.slice(7);
load().then(() => {
  try { const s = JSON.parse(localStorage.getItem("sr_cart") || "{}");
    products.forEach(p => { if (s[p.name]) cart[p.id] = s[p.name]; }); } catch(e){}
  draw();
});
