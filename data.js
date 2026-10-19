// Paste your Firebase web-app config here (see README.md). Leave null for demo mode.
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC_NOf4cnhXnaZo4F99OjzdnFVhcjhDHEg",
  authDomain: "ck-traders-and-sons.firebaseapp.com",
  projectId: "ck-traders-and-sons",
  storageBucket: "ck-traders-and-sons.firebasestorage.app",
  messagingSenderId: "245356130533",
  appId: "1:245356130533:web:aed8bf1fbb62e5216fa40c"
};

const SEED = {
  shops: {
    ckt: { name: "CK Traders", tag: "Spices", phone: "" },
    cks: { name: "CK Sons", tag: "Pulses", phone: "" }
  },
  products: [
    { id: "turmeric", shop: "ckt", name: "Turmeric", img: "images/turmeric.jpg", variants: [{ kg: 50, rate: 0 }] },
    { id: "red-chilli", shop: "ckt", name: "Red Chilli", img: "images/red-chilli.jpg", variants: [{ kg: 40, max: 43, rate: 0 }] },
    { id: "coriander", shop: "ckt", name: "Coriander", img: "images/coriander.jpg", variants: [{ kg: 50, rate: 0 }] },
    ...[["green-peas", "Green Peas"], ["chickpeas", "Chickpeas"], ["rajma", "Rajma"],
        ["chana-dal", "Chana Dal"], ["green-gram", "Green Gram"], ["masoor-dal", "Masoor Dal"]]
      .map(([id, name]) => ({ id, shop: "cks", name, img: `images/${id}.jpg`, variants: [{ kg: 30, rate: 0 }, { kg: 50, rate: 0 }] }))
  ]
};

const loadScript = u => new Promise(r => { const s = document.createElement("script"); s.src = u; s.onload = r; document.head.appendChild(s); });

async function fb() {
  if (!FIREBASE_CONFIG) return null;
  if (!window.firebase) {
    for (const n of ["app", "firestore", "auth"]) await loadScript(`https://www.gstatic.com/firebasejs/10.12.2/firebase-${n}-compat.js`);
    firebase.initializeApp(FIREBASE_CONFIG);
  }
  return firebase;
}

const Store = {
  fb,
  async load() {
    try {
      const f = await fb();
      if (f) { const s = await f.firestore().doc("site/catalogue").get(); if (s.exists) return JSON.parse(s.data().data); }
      else { const l = localStorage.getItem("ck-catalogue"); if (l) return JSON.parse(l); }
    } catch (e) { console.warn(e); }
    return structuredClone(SEED);
  },
  async save(d) {
    const f = await fb();
    if (f) await f.firestore().doc("site/catalogue").set({ data: JSON.stringify(d) });
    else localStorage.setItem("ck-catalogue", JSON.stringify(d));
  },
    async addOrder(o) {
    const f = await fb();
    if (!f) { const l = JSON.parse(localStorage.getItem("ck-orders") || "[]"); l.push(o); localStorage.setItem("ck-orders", JSON.stringify(l)); return; }
    await f.firestore().collection("orders").add(o);
  },
  async orders() {
    const f = await fb();
    if (!f) return JSON.parse(localStorage.getItem("ck-orders") || "[]").reverse().map((o, i) => ({ id: "L" + i, ...o }));
    const s = await f.firestore().collection("orders").orderBy("at", "desc").limit(100).get();
    return s.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async setOrder(id, patch) { const f = await fb(); if (f) await f.firestore().collection("orders").doc(id).update(patch); },
  async delOrder(id) { const f = await fb(); if (f) await f.firestore().collection("orders").doc(id).delete(); }

};
