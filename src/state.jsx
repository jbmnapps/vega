// Shared app state — seeded with Vega's data.
// Day state: 'morning' (plan mostly empty) | 'midday' (one logged) | 'evening' (aftenmad pending) | 'complete'

function useAppState() {
  const [day, setDay] = React.useState('midday');
  const [showPhoto, setShowPhoto] = React.useState(true);

  // Weight log — seeded history in kg
  const [weights, setWeights] = React.useState([
    { date: '2026-02-18', kg: 4.35 },
    { date: '2026-02-25', kg: 4.30 },
    { date: '2026-03-04', kg: 4.28 },
    { date: '2026-03-12', kg: 4.25 },
    { date: '2026-03-21', kg: 4.22 },
    { date: '2026-03-29', kg: 4.20 },
    { date: '2026-04-07', kg: 4.18 },
    { date: '2026-04-15', kg: 4.20 },
  ]);

  // Product library — kcal/100g
  const [products, setProducts] = React.useState([
    { id: 'p1', name: 'Hill’s Science Plan Kitten', type: 'Tørfoder', kcal100: 412 },
    { id: 'p2', name: 'Sheba Fine Flakes, Tun', type: 'Vådfoder', kcal100: 78 },
    { id: 'p3', name: 'Royal Canin Indoor', type: 'Tørfoder', kcal100: 395 },
    { id: 'p4', name: 'Kattesnack, laks', type: 'Snack', kcal100: 340 },
  ]);

  // Food log for today
  const [foodLog, setFoodLog] = React.useState([
    { id: 'f1', productId: 'p1', grams: 18, time: '08:05' },
    { id: 'f2', productId: 'p2', grams: 45, time: '12:30' },
  ]);

  const kcalTarget = 220;

  // Plan — items user built themselves
  // completed reflects day state
  const planBase = [
    { id: 'pl1', label: 'Morgenmad', time: '08:00', kind: 'food' },
    { id: 'pl2', label: 'Frokost', time: '12:30', kind: 'food' },
    { id: 'pl3', label: 'Legetid', time: '16:00', kind: 'play' },
    { id: 'pl4', label: 'Aftenmad', time: '19:00', kind: 'food' },
  ];
  const [planDone, setPlanDone] = React.useState(() => {
    return { pl1: true, pl2: true, pl3: false, pl4: false };
  });

  // When day state changes, reset plan
  React.useEffect(() => {
    if (day === 'morning') setPlanDone({ pl1: false, pl2: false, pl3: false, pl4: false });
    if (day === 'midday') setPlanDone({ pl1: true, pl2: true, pl3: false, pl4: false });
    if (day === 'evening') setPlanDone({ pl1: true, pl2: true, pl3: true, pl4: false });
    if (day === 'complete') setPlanDone({ pl1: true, pl2: true, pl3: true, pl4: true });
  }, [day]);

  // Observations
  const [observations, setObservations] = React.useState([
    { id: 'o1', text: 'Slæbte numsen hen over gulvet', date: '2026-04-14', time: '18:20' },
    { id: 'o2', text: 'Sover meget i dag', date: '2026-04-15', time: '14:00' },
    { id: 'o3', text: 'Klør sig på nakken', date: '2026-04-17', time: '09:15' },
  ]);

  // Vocabulary — learned from observations
  const vocab = React.useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const o of observations) {
      if (!seen.has(o.text)) { seen.add(o.text); out.push(o.text); }
    }
    return out;
  }, [observations]);

  const addWeight = (kg) => {
    const today = new Date().toISOString().slice(0, 10);
    setWeights(w => [...w, { date: today, kg: parseFloat(kg) }]);
  };

  const addFoodLog = (productId, grams) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    setFoodLog(l => [...l, { id: 'f' + Date.now(), productId, grams: parseFloat(grams), time }]);
  };

  const addProduct = (p) => {
    const id = 'p' + Date.now();
    setProducts(ps => [...ps, { ...p, id }]);
    return id;
  };

  const togglePlan = (id) => setPlanDone(d => ({ ...d, [id]: !d[id] }));
  const completePlanFromFood = (kind) => {
    // Check first incomplete food item
    for (const p of planBase) {
      if (p.kind === 'food' && !planDone[p.id]) {
        setPlanDone(d => ({ ...d, [p.id]: true }));
        return;
      }
    }
  };

  const addObservation = (text) => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    setObservations(o => [{ id: 'o' + Date.now(), text, date, time }, ...o]);
  };

  return {
    day, setDay, showPhoto, setShowPhoto,
    weights, addWeight,
    products, addProduct,
    foodLog, addFoodLog, kcalTarget,
    plan: planBase, planDone, togglePlan, completePlanFromFood,
    observations, vocab, addObservation,
  };
}

// Helpers
function kcalForLog(products, log) {
  const p = products.find(x => x.id === log.productId);
  if (!p) return 0;
  return Math.round((p.kcal100 / 100) * log.grams);
}

function productName(products, id) {
  return products.find(p => p.id === id)?.name || '';
}

function todayKcal(products, foodLog) {
  return foodLog.reduce((s, l) => s + kcalForLog(products, l), 0);
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
window.productName = productName;
window.todayKcal = todayKcal;
window.fmtDelta = fmtDelta;
window.fmtKg = fmtKg;
