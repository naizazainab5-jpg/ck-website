const $ = s => document.querySelector(s);
let D, shop = "cks";
const money = n => "₹" + Math.round(n).toLocaleString("en-IN");
const kgTxt = v => v.kg + (v.max > v.kg ? "–" + v.max : "") + " kg";
const vName = v => (v.name ? v.name + " · " : "") + kgTxt(v) + " bag";
const priceHtml = v => !v.rate ? "<small>Rate on request</small>" :
  `${money(v.rate)}<small> /kg</small><br><small>≈ ${money(v.rate * v.kg)}${v.max > v.kg ? "–" + money(v.rate * v.max) : ""} per bag</small>`;

const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
const watch = () => document.querySelectorAll(".reveal:not(.in)").forEach(el => io.observe(el));

function render() {
  const vis = D.products.filter(p => !p.hidden);
  $("#tabs").innerHTML = Object.entries(D.shops).map(([k, s]) =>
    `<button class="tab ${k === shop ? "on" : ""}" data-shop="${k}"><strong>${s.name}</strong><span>${s.tag} · ${vis.filter(p => p.shop === k).length} products</span></button>`).join("");
  $("#grid").innerHTML = vis.filter(p => p.shop === shop).map(p => `
    <article class="card reveal" data-id="${p.id}"><div class="im"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>
    <div class="bd"><h3>${p.name}</h3>
    ${p.variants.length > 1 ? `<select class="vsel" aria-label="Bag option">${p.variants.map((x, i) => `<option value="${i}">${vName(x)}</option>`).join("")}</select>` : `<div>${vName(p.variants[0])}</div>`}
    <div class="price">${priceHtml(p.variants[0])}</div><button class="btn" data-enq>Enquire ↗</button></div></article>`).join("");
  watch();
}

function fillProd() {
  $("#prod").innerHTML = Object.entries(D.shops).map(([k, s]) =>
    `<optgroup label="${s.name}">${D.products.filter(p => p.shop === k && !p.hidden).map(p => `<option value="${p.id}">${p.name}</option>`).join("")}</optgroup>`).join("");
  fillVar();
}
const pv = () => { const p = D.products.find(x => x.id === $("#prod").value); return [p, p.variants[+$("#var").value || 0]]; };
function fillVar(i = 0) {
  const [p] = pv();
  $("#var").innerHTML = p.variants.map((v, j) => `<option value="${j}">${vName(v)}</option>`).join("");
  $("#var").value = i; setBags(1);
}
function setBags(b) { b = Math.max(1, b || 1); $("#bags").value = b; $("#kg").value = +(b * pv()[1].kg).toFixed(1); est(); }
function setKg(k) { k = Math.max(1, k || 1); $("#kg").value = k; $("#bags").value = +(k / pv()[1].kg).toFixed(1); est(); }
function est() {
  const v = pv()[1], k = +$("#kg").value;
  $("#est").textContent = v.rate ? `Estimated ${money(k * v.rate)} for ${k} kg. The shop confirms the final rate.` : "The shop will confirm the rate for this order.";
}

document.addEventListener("click", e => {
  const t = e.target.closest("[data-shop],[data-go],[data-enq],[data-t]");
  if (!t) return;
  if (t.dataset.shop || t.dataset.go) {
    shop = t.dataset.shop || t.dataset.go; render();
    if (t.dataset.go) $("#products").scrollIntoView({ behavior: "smooth" });
  } else if (t.dataset.enq) {
    const c = t.closest(".card"), s = c.querySelector(".vsel");
    $("#prod").value = c.dataset.id; fillVar(s ? +s.value : 0);
    $("#order").scrollIntoView({ behavior: "smooth" });
  } else {
    const d = +t.dataset.d;
    t.dataset.t === "bags" ? setBags(+$("#bags").value + d) : setKg(+$("#kg").value + d);
  }
});
document.addEventListener("change", e => {
  if (e.target.classList.contains("vsel")) {
    const c = e.target.closest(".card"), p = D.products.find(x => x.id === c.dataset.id);
    c.querySelector(".price").innerHTML = priceHtml(p.variants[+e.target.value]);
  }
});
$("#prod").onchange = () => fillVar();
$("#var").onchange = () => setBags(+$("#bags").value);
$("#bags").oninput = e => setBags(+e.target.value);
$("#kg").oninput = e => setKg(+e.target.value);

$("#f").onsubmit = e => {
  e.preventDefault();
  const [p, v] = pv(), s = D.shops[p.shop], ph = (s.phone || "").replace(/\D/g, "");
  if (!ph) return alert("This shop’s WhatsApp number is not set yet. Please call the shop directly.");
  const t = `*New order enquiry – ${s.name}*\nName: ${$("#nm").value}\nBusiness: ${$("#bz").value}\nPhone: ${$("#ph").value}\nProduct: ${p.name} (${vName(v)})\nBags: ${$("#bags").value} | Total: ${$("#kg").value} kg` + ($("#nt").value ? `\nNotes: ${$("#nt").value}` : "");
  open(`https://wa.me/${ph}?text=${encodeURIComponent(t)}`, "_blank");
};

$("#yr").textContent = new Date().getFullYear();
watch();
Store.load().then(d => { D = d; render(); fillProd(); });
