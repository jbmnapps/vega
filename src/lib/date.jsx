// Lokal dato-helpers. `toISOString()` returnerer UTC-baseret dato, hvilket kan
// give forkert dag omkring midnat (fx kl. 23:30 dansk tid → UTC næste dag).
// `localISO()` bygger YYYY-MM-DD ud fra lokal tid. Skal bruges overalt hvor
// "i dag" eller datoer på logs/observationer beregnes.

function localISO(date) {
  const d = date || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

window.localISO = localISO;
