// Shared app state — seeded with Vega's data.
// Day state: 'morning' (plan mostly empty) | 'midday' (one logged) | 'evening' (aftenmad pending) | 'complete'

function useAppState() {
  const [day, setDay] = React.useState('midday');
  const [showPhoto, setShowPhoto] = React.useState(true);

  // Cat profile
  const [catName, setCatName] = React.useState('Vega');
  const [birthdate, setBirthdate] = React.useState('2025-04-27'); // YYYY-MM-DD
  const [breed, setBreed] = React.useState('Huskat');
  const [vet, setVet] = React.useState('Kongelundens Dyreklinik');
  const [kcalTarget, setKcalTarget] = React.useState(null);

  // Hero-foto (Decision #94) — custom foto (data-URL) + vertikal placering 0-100%.
  // Persisteres i localStorage: tab-restart bevarer valget.
  const [heroPhotoDataUrl, setHeroPhotoDataUrlState] = React.useState(() => {
    try { return localStorage.getItem('mycat-hero-photo') || null; } catch { return null; }
  });
  const [heroPhotoOffsetY, setHeroPhotoOffsetYState] = React.useState(() => {
    try {
      const v = localStorage.getItem('mycat-hero-offset-y');
      return v != null ? parseFloat(v) : 50;
    } catch { return 50; }
  });
  // true = fotoets top er mørkt → statusbar-ikoner skal være lyse. Default
  // false (vega-hero.jpg er lyst). Samples én gang ved upload.
  const [heroIconDark, setHeroIconDarkState] = React.useState(() => {
    try { return localStorage.getItem('mycat-hero-icon-dark') === '1'; }
    catch { return false; }
  });

  const setHeroPhoto = (dataUrl) => {
    setHeroPhotoDataUrlState(dataUrl);
    setHeroPhotoOffsetYState(50);
    try {
      if (dataUrl) localStorage.setItem('mycat-hero-photo', dataUrl);
      else localStorage.removeItem('mycat-hero-photo');
      localStorage.setItem('mycat-hero-offset-y', '50');
    } catch {}
    // Sample fotoets top-stripe for at afgøre ikon-farve. Async — ikoner
    // flipper når målingen lander (typisk <50ms).
    if (dataUrl) {
      sampleHeroTopIsDark(dataUrl).then(isDark => {
        setHeroIconDarkState(isDark);
        try { localStorage.setItem('mycat-hero-icon-dark', isDark ? '1' : '0'); } catch {}
      });
    } else {
      setHeroIconDarkState(false);
      try { localStorage.setItem('mycat-hero-icon-dark', '0'); } catch {}
    }
  };

  const setHeroPhotoOffsetY = (n) => {
    const clamped = Math.max(0, Math.min(100, n));
    setHeroPhotoOffsetYState(clamped);
    try { localStorage.setItem('mycat-hero-offset-y', String(clamped)); } catch {}
  };

  const removeHeroPhoto = () => setHeroPhoto(null);

  // Weight log — seeded history in kg
  const [weights, setWeights] = React.useState([
    { date: '2025-04-22', kg: 3.05 },
    { date: '2025-05-09', kg: 3.22 },
    { date: '2025-05-28', kg: 3.38 },
    { date: '2025-06-18', kg: 3.52 },
    { date: '2025-07-07', kg: 3.61 },
    { date: '2025-07-28', kg: 3.58 },
    { date: '2025-08-19', kg: 3.74 },
    { date: '2025-09-08', kg: 3.85 },
    { date: '2025-09-29', kg: 3.90 },
    { date: '2025-10-20', kg: 3.88 },
    { date: '2025-11-10', kg: 4.02 },
    { date: '2025-11-28', kg: 4.10 },
    { date: '2025-12-15', kg: 4.18 },
    { date: '2025-12-30', kg: 4.22 },
    { date: '2026-01-20', kg: 4.18 },
    { date: '2026-02-10', kg: 4.22 },
    { date: '2026-02-25', kg: 4.20 },
    { date: '2026-03-08', kg: 4.18 },
    { date: '2026-03-22', kg: 4.22 },
    { date: '2026-04-05', kg: 4.20 },
    { date: '2026-04-15', kg: 4.20 },
  ]);

  // Product library — kcal/100g
  const [products, setProducts] = React.useState([
    { id: 'p1', name: 'Hill’s Science Plan Kitten', type: 'Tørfoder', kcal100: 412 },
    { id: 'p2', name: 'Sheba Fine Flakes, Tun', type: 'Vådfoder', kcal100: 78 },
    { id: 'p3', name: 'Royal Canin Indoor', type: 'Tørfoder', kcal100: 395 },
    { id: 'p4', name: 'Kattesnack, laks', type: 'Snack', kcal100: 340 },
  ]);

  // Food log — dated entries.
  // kcal100Snapshot = produktets kcal/100g på log-tidspunktet. Bruges ikke til
  // visning/sum (live join via produkt), men tillader at vise "oprindeligt
  // logget som N kcal" hvis produktets kcal er rettet siden. Decision #93.
  const _today = window.localISO();
  const [foodLog, setFoodLog] = React.useState([
    { id: 'f1', productId: 'p1', grams: 18, time: '08:05', date: _today, kcal100Snapshot: 412 },
    { id: 'f2', productId: 'p2', grams: 45, time: '12:30', date: _today, kcal100Snapshot: 78 },
  ]);

  // Plan — items user built themselves. Starts empty; plan is optional (Decision #50).
  const [planBase, setPlanBase] = React.useState([]);
  const [planDone, setPlanDone] = React.useState({});

  // Observations
  const [observations, setObservations] = React.useState([
    { id: 'o1', text: 'Slæbte numsen hen over gulvet', date: '2026-04-14', time: '18:20' },
    { id: 'o2', text: 'Sover meget i dag', date: '2026-04-15', time: '14:00' },
    { id: 'o3', text: 'Klør sig på nakken', date: '2026-04-17', time: '09:15' },
    { id: 'o4', text: 'Hostet to gange', date: '2026-04-18', time: '07:40' },
    { id: 'o5', text: 'Drikker mere end normalt', date: '2026-04-19', time: '11:05' },
    { id: 'o6', text: 'Kastede op efter morgenmad', date: '2026-04-20', time: '08:10' },
    { id: 'o7', text: 'Legede længe med musen', date: '2026-04-21', time: '19:30' },
  ]);

  // Vocabulary — learned from observations, most recent first (chronological, not frequency)
  const vocab = React.useMemo(() => {
    const sorted = [...observations].sort((a, b) => {
      const d = b.date.localeCompare(a.date);
      return d !== 0 ? d : b.time.localeCompare(a.time);
    });
    const seen = new Set();
    const out = [];
    for (const o of sorted) {
      if (!seen.has(o.text)) { seen.add(o.text); out.push(o.text); }
    }
    return out;
  }, [observations]);

  const addWeight = (kg, date) => {
    const d = date || window.localISO();
    setWeights(w => {
      const next = [...w, { date: d, kg: parseFloat(kg) }];
      next.sort((a, b) => a.date.localeCompare(b.date));
      return next;
    });
  };

  const addFoodLog = ({ productId, grams, time, date, planId }) => {
    const now = new Date();
    const t = time || `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const d = date || window.localISO(now);
    // Snapshot produktets kcal100 ved log-tidspunktet (Decision #93).
    // Slås op fra nuværende state — capture "som det var nu".
    const product = products.find(p => p.id === productId);
    const snapshot = product?.kcal100 ?? null;
    setFoodLog(l => [...l, {
      id: 'f' + Date.now(),
      productId, grams: parseFloat(grams),
      time: t, date: d,
      planId: planId || null,
      kcal100Snapshot: snapshot,
    }]);
    if (planId) setPlanDone(pd => ({ ...pd, [planId]: true }));
  };

  const addProduct = (p) => {
    const id = 'p' + Date.now();
    setProducts(ps => [...ps, { ...p, id }]);
    return id;
  };

  // Soft-delete: arkiverer i stedet for at slette (Decision #93).
  // Produktet skjules i UI (pickers + produktliste), men gamle logs kan
  // stadig slå op via id og vise navn/type.
  const removeProduct = (id) => {
    setProducts(ps => ps.map(p => p.id === id ? { ...p, archived: true } : p));
  };

  const addPlanPost = ({ label, time, category, details, done }) => {
    const id = 'pl' + Date.now();
    setPlanBase(p => [...p, {
      id, label, time,
      kind: category || 'custom',
      category: category || null,
      details: details || null,
    }]);
    setPlanDone(d => ({ ...d, [id]: !!done }));
  };

  const updatePlanPost = (id, { label, time, category, details, done }) => {
    setPlanBase(p => p.map(x => x.id === id ? {
      ...x, label, time,
      kind: category || 'custom',
      category: category || null,
      details: details || null,
    } : x));
    setPlanDone(d => ({ ...d, [id]: !!done }));
  };

  const removePlanPost = (id) => {
    setPlanBase(p => p.filter(x => x.id !== id));
    setPlanDone(d => { const n = { ...d }; delete n[id]; return n; });
  };

  const togglePlan = (id) => setPlanDone(d => ({ ...d, [id]: !d[id] }));

  const addObservation = (text, date) => {
    const now = new Date();
    const today = window.localISO(now);
    const d = date || today;
    // On today: stamp with current time. On past days: default to noon (minuttal
    // er sjældent relevant for obs, og "nu" giver ikke mening bagud).
    const time = d === today
      ? `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
      : '12:00';
    setObservations(o => [{ id: 'o' + Date.now(), text, date: d, time }, ...o]);
  };

  const removeObservation = (id) => {
    setObservations(o => o.filter(x => x.id !== id));
  };

  return {
    day, setDay, showPhoto, setShowPhoto,
    catName, setCatName,
    birthdate, setBirthdate,
    breed, setBreed,
    vet, setVet,
    kcalTarget, setKcalTarget,
    heroPhotoDataUrl, heroPhotoOffsetY, heroIconDark,
    setHeroPhoto, setHeroPhotoOffsetY, removeHeroPhoto,
    weights, addWeight,
    products, addProduct, removeProduct,
    foodLog, addFoodLog,
    plan: planBase, planDone, togglePlan, addPlanPost, updatePlanPost, removePlanPost,
    observations, vocab, addObservation, removeObservation,
  };
}

// Sampler luminans af fotoets top-stripe (øverste 15%) for at afgøre om
// statusbar-ikoner skal være lyse eller mørke. Returnerer Promise<boolean>:
// true = mørkt foto, brug lyse ikoner. Kørt én gang pr. upload.
function sampleHeroTopIsDark(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const w = 120;
        const h = Math.max(1, Math.round(img.height * (w / img.width) * 0.15));
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, img.height * (w / img.width));
        const data = ctx.getImageData(0, 0, w, h).data;
        let sum = 0, n = 0;
        for (let i = 0; i < data.length; i += 16) {
          // WCAG relative luminance, coarse
          sum += 0.2126 * data[i] + 0.7152 * data[i+1] + 0.0722 * data[i+2];
          n++;
        }
        const avg = sum / n;
        // Tærskel 140: lidt over midten, favoriserer dark-icons-default
        // så ikoner kun flipper til lys på tydeligt mørke fotos.
        resolve(avg < 140);
      } catch { resolve(false); }
    };
    img.onerror = () => resolve(false);
    img.src = dataUrl;
  });
}

// Age from YYYY-MM-DD birthdate → "1 år 2 mdr" / "3 mdr" / "2 år"
function ageFromBirthdate(birthdate) {
  if (!birthdate) return '';
  const b = new Date(birthdate);
  if (isNaN(b.getTime())) return '';
  const now = new Date();
  let years = now.getFullYear() - b.getFullYear();
  let months = now.getMonth() - b.getMonth();
  if (now.getDate() < b.getDate()) months -= 1;
  if (months < 0) { years -= 1; months += 12; }
  if (years < 0) return '';
  if (years === 0 && months === 0) return 'under 1 mdr';
  if (years === 0) return `${months} mdr`;
  if (months === 0) return `${years} år`;
  return `${years} år ${months} mdr`;
}

// Format YYYY-MM-DD → "12. marts 2025"
function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const months = ['januar','februar','marts','april','maj','juni','juli','august','september','oktober','november','december'];
  return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Helpers
function kcalForLog(products, log) {
  const p = products.find(x => x.id === log.productId);
  if (!p) return 0;
  return Math.round((p.kcal100 / 100) * log.grams);
}

// "Oprindeligt logget som N kcal" — returnerer det snapshot'ede kcal-tal
// hvis det afviger fra nuværende produktværdi. Null hvis ingen forskel
// (eller intet snapshot). Decision #93.
function originalKcalForLog(products, log) {
  if (log.kcal100Snapshot == null) return null;
  const p = products.find(x => x.id === log.productId);
  if (!p || p.kcal100 == null) return null;
  if (p.kcal100 === log.kcal100Snapshot) return null;
  return Math.round((log.kcal100Snapshot / 100) * log.grams);
}

function productName(products, id) {
  return products.find(p => p.id === id)?.name || '';
}

function kcalForDate(products, foodLog, date) {
  return foodLog.filter(l => l.date === date).reduce((s, l) => s + kcalForLog(products, l), 0);
}

function todayKcal(products, foodLog) {
  const today = window.localISO();
  return kcalForDate(products, foodLog, today);
}

// Format delta weight
function fmtDelta(a, b) {
  const d = a - b;
  if (Math.abs(d) < 0.005) return '±0';
  return (d > 0 ? '+' : '') + d.toFixed(2).replace('-', '−') + ' kg';
}

// Format kg
function fmtKg(kg) {
  return kg.toFixed(2).replace('.', ',') + ' kg';
}

window.useAppState = useAppState;
window.kcalForLog = kcalForLog;
window.originalKcalForLog = originalKcalForLog;
window.productName = productName;
window.todayKcal = todayKcal;
window.kcalForDate = kcalForDate;
window.fmtDelta = fmtDelta;
window.fmtKg = fmtKg;
window.ageFromBirthdate = ageFromBirthdate;
window.fmtDate = fmtDate;
