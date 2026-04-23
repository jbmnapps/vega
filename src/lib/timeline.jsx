// Timeline — derived view of foodLog + weights + observations + completed plans.
// Pure function, no React. Maps 1:1 to a Swift `func buildTimeline(...)` in Phase 2.

function buildTimeline(app, today) {
  const events = [];

  for (const f of app.foodLog) {
    const p = app.products.find(x => x.id === f.productId);
    const hasKcal = p && p.kcal100 != null;
    const kcal = hasKcal ? window.kcalForLog(app.products, f) : null;
    const originalKcal = window.originalKcalForLog(app.products, f);
    events.push({
      type: 'food', date: f.date || today, time: f.time,
      title: p?.name || 'Foder',
      meta: hasKcal ? `${f.grams} g · ${kcal} kcal` : `${f.grams} g`,
      note: originalKcal != null ? `oprindeligt ${originalKcal} kcal` : null,
    });
  }
  for (const w of app.weights) {
    events.push({
      type: 'weight', date: w.date, time: '00:00',
      title: 'Vægt', meta: `${w.kg.toFixed(2).replace('.', ',')} kg`, note: null,
    });
  }
  for (const o of app.observations) {
    events.push({ type: 'obs', date: o.date, time: o.time, title: o.text, meta: '', note: null });
  }
  for (const p of app.plan) {
    if (app.planDone[p.id]) {
      events.push({ type: 'plan', date: today, time: p.time, title: p.label, meta: 'afkrydset', note: null });
    }
  }

  const grouped = {};
  for (const e of events) { (grouped[e.date] = grouped[e.date] || []).push(e); }
  const dates = Object.keys(grouped).sort().reverse();

  return { events, grouped, dates };
}

function closestWeight(weights, date) {
  let best = null; let bestDiff = Infinity;
  for (const w of weights) {
    const d = Math.abs(new Date(w.date) - new Date(date));
    if (d < bestDiff) { bestDiff = d; best = w; }
  }
  return best;
}

window.buildTimeline = buildTimeline;
window.closestWeight = closestWeight;
