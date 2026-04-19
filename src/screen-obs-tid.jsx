// Observationer — canvas-first (blank-per-day) with toggle to a flat list.
// Tidslinje — vertical spine of dots; tap a day to expand details inline.

// ─── Observationer ────────────────────────────────────────────────────────
function ObservationerScreen({ app }) {
  const [view, setView] = React.useState('canvas'); // canvas | list

  return (
    <div style={{ padding: '0 0 120px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Observationer" trailing={
        <ViewToggle view={view} onChange={setView} />
      } />
      {view === 'canvas'
        ? <ObsCanvas app={app} />
        : <ObsList app={app} />}
    </div>
  );
}

function ViewToggle({ view, onChange }) {
  return (
    <div style={{
      display: 'inline-flex', background: TOKENS.surfaceAlt,
      borderRadius: 9, padding: 2, gap: 0,
    }}>
      <button onClick={() => onChange('canvas')} style={toggleBtn(view === 'canvas')}>
        <svg width="13" height="13" viewBox="0 0 13 13">
          <rect x="2" y="2" width="9" height="9" rx="1.5" fill="none" stroke={view === 'canvas' ? TOKENS.ink : TOKENS.inkMuted} strokeWidth="1.1" />
        </svg>
      </button>
      <button onClick={() => onChange('list')} style={toggleBtn(view === 'list')}>
        <svg width="13" height="13" viewBox="0 0 13 13">
          <path d="M2 3.5h9M2 6.5h9M2 9.5h7" stroke={view === 'list' ? TOKENS.ink : TOKENS.inkMuted} strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
const toggleBtn = (active) => ({
  background: active ? TOKENS.surface : 'transparent',
  border: 'none', padding: '5px 9px', borderRadius: 7, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
});

// Canvas: one day at a time with < > date navigation, blank text area for adding.
function ObsCanvas({ app }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = React.useState(today);
  const [text, setText] = React.useState('');

  const shiftDate = (days) => {
    const d = new Date(date); d.setDate(d.getDate() + days);
    setDate(d.toISOString().slice(0, 10));
  };

  const dayObs = app.observations.filter(o => o.date === date).sort((a, b) => a.time.localeCompare(b.time));

  const submit = () => {
    if (!text.trim()) return;
    // addObservation timestamps with today regardless — that's fine per brief
    app.addObservation(text.trim());
    setText('');
    setDate(today);
  };

  const isToday = date === today;
  const isFuture = new Date(date) > new Date(today);

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '0 0 40px' }}>
      {/* Date swiper */}
      <div style={{
        padding: '8px 20px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
      }}>
        <button onClick={() => shiftDate(-1)} style={arrowBtn}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M9 2L4 7l5 5" fill="none" stroke={TOKENS.ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div style={{ textAlign: 'center', minWidth: 160 }}>
          <div style={{
            ...baseText, fontSize: 18, fontWeight: 500, color: TOKENS.ink,
            letterSpacing: '-0.02em',
          }}>{isToday ? 'I dag' : formatDanishDate(date)}</div>
          {!isToday && (
            <div style={{
              ...baseText, fontSize: 11, color: TOKENS.inkMuted,
              marginTop: 2, letterSpacing: '0.04em',
            }}>{weekdayDanish(date)}</div>
          )}
        </div>
        <button onClick={() => !isFuture && shiftDate(1)} disabled={isFuture} style={{ ...arrowBtn, opacity: isFuture ? 0.3 : 1 }}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M5 2l5 5-5 5" fill="none" stroke={TOKENS.ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      {/* Blank canvas — input box */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{
          background: TOKENS.surface, borderRadius: 16,
          padding: 18, border: `0.5px solid ${TOKENS.line}`,
          minHeight: 160,
        }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(); }}
            placeholder={isToday ? 'Hvad lagde du mærke til?' : 'Ingen observationer denne dag'}
            disabled={!isToday && dayObs.length === 0 && !text}
            style={{
              ...baseText, width: '100%', border: 'none', outline: 'none',
              background: 'transparent', resize: 'none',
              fontSize: 16, color: TOKENS.ink, lineHeight: 1.55,
              letterSpacing: '-0.01em', minHeight: 100,
            }}
          />
          {text.trim() && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={submit} style={{
                ...baseText, padding: '8px 16px', borderRadius: 10,
                background: TOKENS.ink, color: TOKENS.bg, border: 'none',
                fontSize: 13, fontWeight: 500, cursor: 'pointer', letterSpacing: '-0.01em',
              }}>Gem</button>
            </div>
          )}
        </div>

        {/* Vocab quick-pick — only on today when empty */}
        {isToday && !text && app.vocab.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ ...baseText, fontSize: 10.5, color: TOKENS.inkMuted, textTransform: 'uppercase', letterSpacing: '0.14em', padding: '0 4px 8px' }}>
              Tidligere
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {app.vocab.slice(0, 5).map((v, i) => (
                <button key={i} onClick={() => setText(v)} style={{
                  ...baseText, padding: '7px 12px', borderRadius: 8,
                  background: TOKENS.surface, border: `0.5px solid ${TOKENS.line}`,
                  color: TOKENS.inkSoft, fontSize: 12, cursor: 'pointer', letterSpacing: '-0.01em',
                }}>{v}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Day's prior entries (if any) — shown below as gentle context */}
      {dayObs.length > 0 && (
        <div style={{ padding: '0 20px' }}>
          <div style={{ ...baseText, fontSize: 10.5, color: TOKENS.inkMuted, textTransform: 'uppercase', letterSpacing: '0.14em', padding: '0 6px 10px' }}>
            Denne dag
          </div>
          <Card padding={0}>
            {dayObs.map((o, i) => (
              <div key={o.id}>
                <div style={{ padding: '14px 18px' }}>
                  <div style={{ ...baseText, fontSize: 14, color: TOKENS.ink, letterSpacing: '-0.01em', lineHeight: 1.45 }}>{o.text}</div>
                  <div style={{ ...baseText, fontSize: 11, color: TOKENS.inkMuted, marginTop: 3, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.005em' }}>kl. {o.time}</div>
                </div>
                {i < dayObs.length - 1 && <Divider inset={18} />}
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}

const arrowBtn = {
  width: 36, height: 36, borderRadius: 18,
  background: 'transparent', border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

function weekdayDanish(iso) {
  const d = new Date(iso);
  const wds = ['Søndag','Mandag','Tirsdag','Onsdag','Torsdag','Fredag','Lørdag'];
  return wds[d.getDay()];
}

// List view — chronological stream grouped by date, as before.
function ObsList({ app }) {
  const grouped = app.observations.reduce((acc, o) => {
    (acc[o.date] = acc[o.date] || []).push(o);
    return acc;
  }, {});
  const dates = Object.keys(grouped).sort().reverse();

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '0 0 40px' }}>
      {dates.length === 0 && (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ ...baseText, fontSize: 14, color: TOKENS.inkMuted, letterSpacing: '-0.005em' }}>
            Ingen observationer endnu
          </div>
        </div>
      )}
      {dates.map(date => (
        <div key={date} style={{ padding: '0 20px 20px' }}>
          <div style={{ padding: '0 6px 10px' }}>
            <SectionLabel>{formatDanishDate(date)}</SectionLabel>
          </div>
          <Card padding={0}>
            {grouped[date].map((o, i) => (
              <div key={o.id}>
                <div style={{ padding: '14px 18px' }}>
                  <div style={{ ...baseText, fontSize: 14, color: TOKENS.ink, letterSpacing: '-0.01em', lineHeight: 1.45 }}>{o.text}</div>
                  <div style={{ ...baseText, fontSize: 11, color: TOKENS.inkMuted, marginTop: 3, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.005em' }}>kl. {o.time}</div>
                </div>
                {i < grouped[date].length - 1 && <Divider inset={18} />}
              </div>
            ))}
          </Card>
        </div>
      ))}
    </div>
  );
}

// Kept for backward-compat with modal route — uses canvas behavior
function ObsNewScreen({ app, onBack, onComplete }) {
  const [text, setText] = React.useState('');
  const valid = text.trim().length > 0;
  const submit = () => {
    if (!valid) return;
    app.addObservation(text.trim());
    onComplete();
  };
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Ny observation" onBack={onBack} />
      <div style={{ flex: 1, padding: '0 20px 120px', overflow: 'auto' }}>
        <div style={{ padding: '12px 6px 10px' }}>
          <SectionLabel>Noter</SectionLabel>
        </div>
        <div style={{
          background: TOKENS.surface, borderRadius: 14,
          padding: 16, border: `0.5px solid ${TOKENS.line}`,
          minHeight: 120,
        }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Hvad lagde du mærke til?"
            autoFocus
            style={{
              ...baseText, width: '100%', border: 'none', outline: 'none',
              background: 'transparent', resize: 'none',
              fontSize: 16, color: TOKENS.ink, lineHeight: 1.5,
              letterSpacing: '-0.01em', minHeight: 90,
            }}
          />
        </div>
        {app.vocab.length > 0 && (
          <>
            <div style={{ padding: '24px 6px 12px' }}>
              <SectionLabel>Tidligere noteret</SectionLabel>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {app.vocab.map((v, i) => (
                <button key={i} onClick={() => setText(v)} style={{
                  ...baseText, textAlign: 'left', background: TOKENS.surface,
                  border: `0.5px solid ${TOKENS.line}`, borderRadius: 12, padding: '12px 16px',
                  fontSize: 14, color: TOKENS.inkSoft, cursor: 'pointer', letterSpacing: '-0.01em',
                }}>{v}</button>
              ))}
            </div>
          </>
        )}
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '16px 20px 34px',
        background: `linear-gradient(180deg, rgba(244,239,231,0) 0%, ${TOKENS.bg} 40%)`,
      }}>
        <PrimaryButton onClick={submit} disabled={!valid}>Gem</PrimaryButton>
      </div>
    </div>
  );
}

// ─── Tidslinje — a vertical spine of dates ───────────────────────────────
function TidslinjeScreen({ app }) {
  // Build events grouped by date
  const events = [];
  const today = new Date().toISOString().slice(0, 10);
  for (const f of app.foodLog) {
    const p = app.products.find(x => x.id === f.productId);
    const hasKcal = p && p.kcal100 != null;
    const kcal = hasKcal ? window.kcalForLog(app.products, f) : null;
    events.push({
      type: 'food', date: today, time: f.time,
      title: p?.name || 'Foder',
      meta: hasKcal ? `${f.grams} g · ${kcal} kcal` : `${f.grams} g`,
    });
  }
  for (const w of app.weights) {
    events.push({ type: 'weight', date: w.date, time: '00:00',
      title: 'Vægt', meta: `${w.kg.toFixed(2).replace('.', ',')} kg` });
  }
  for (const o of app.observations) {
    events.push({ type: 'obs', date: o.date, time: o.time, title: o.text, meta: '' });
  }
  for (const p of app.plan) {
    if (app.planDone[p.id]) {
      events.push({ type: 'plan', date: today, time: p.time, title: p.label, meta: 'afkrydset' });
    }
  }

  // Group by date
  const grouped = {};
  for (const e of events) { (grouped[e.date] = grouped[e.date] || []).push(e); }
  const dates = Object.keys(grouped).sort().reverse();

  // Focus on most recent day
  const [focusDate, setFocusDate] = React.useState(dates[0]);

  // Weight + age context per day (approx)
  const weightByDate = {};
  for (const w of app.weights) weightByDate[w.date] = w.kg;
  const closestWeight = (date) => {
    let best = null; let bestDiff = Infinity;
    for (const w of app.weights) {
      const d = Math.abs(new Date(w.date) - new Date(date));
      if (d < bestDiff) { bestDiff = d; best = w; }
    }
    return best;
  };

  const typeLabel = { food: 'Foder', weight: 'Vægt', obs: 'Observation', plan: 'Plan' };

  return (
    <div style={{ padding: '0 0 120px' }}>
      <ScreenHeader title="Tidslinje" />

      <div style={{ padding: '4px 0 0' }}>
        {dates.map((date, di) => {
          const isFocus = date === focusDate;
          const events = grouped[date].sort((a, b) => b.time.localeCompare(a.time));
          const w = closestWeight(date);
          const isToday = date === today;

          return (
            <div key={date} style={{ position: 'relative', display: 'flex', padding: '0 24px' }}>
              {/* Spine: line + dot */}
              <div style={{ position: 'relative', width: 28, flexShrink: 0 }}>
                {/* vertical line */}
                <div style={{
                  position: 'absolute', left: 13, top: 0, bottom: 0,
                  width: 1, background: TOKENS.lineStrong,
                }} />
                {/* Hide line extension past last */}
                {di === dates.length - 1 && (
                  <div style={{
                    position: 'absolute', left: 13, top: 40, bottom: 0,
                    width: 2, background: TOKENS.bg,
                  }} />
                )}
                {/* Hide line above first */}
                {di === 0 && (
                  <div style={{
                    position: 'absolute', left: 13, top: 0, height: 20,
                    width: 2, background: TOKENS.bg,
                  }} />
                )}
                {/* Dot */}
                <button onClick={() => setFocusDate(date)} style={{
                  position: 'absolute', left: 5, top: 22,
                  width: isFocus ? 18 : 10, height: isFocus ? 18 : 10,
                  borderRadius: 50, transform: isFocus ? 'translateX(-4px)' : 'none',
                  background: isFocus ? TOKENS.amber : TOKENS.surface,
                  border: isFocus ? 'none' : `1.5px solid ${TOKENS.lineStrong}`,
                  cursor: 'pointer', padding: 0,
                  boxShadow: isFocus ? `0 0 0 4px ${TOKENS.bg}, 0 0 0 5px ${TOKENS.amberSoft}` : `0 0 0 3px ${TOKENS.bg}`,
                  transition: 'all 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                }} />
              </div>

              {/* Content */}
              <div style={{ flex: 1, padding: '16px 0 24px', minWidth: 0 }}>
                <button onClick={() => setFocusDate(date)} style={{
                  background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                  display: 'block', textAlign: 'left', width: '100%',
                }}>
                  <div style={{
                    ...baseText, fontSize: isFocus ? 17 : 14,
                    fontWeight: isFocus ? 500 : 450,
                    color: isFocus ? TOKENS.ink : TOKENS.inkSoft,
                    letterSpacing: '-0.018em', lineHeight: 1.2,
                    transition: 'all 200ms ease',
                  }}>
                    {isToday ? 'I dag' : formatDanishDate(date)}
                  </div>
                  <div style={{
                    ...baseText, fontSize: 11, color: TOKENS.inkMuted,
                    marginTop: 3, letterSpacing: '0.04em',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {w ? `${w.kg.toFixed(2).replace('.', ',')} kg` : ''}
                    {w && ' · '}
                    {events.length} {events.length === 1 ? 'hændelse' : 'hændelser'}
                  </div>
                </button>

                {/* Expanded detail */}
                {isFocus && (
                  <div style={{
                    marginTop: 14,
                    animation: 'fadeIn 300ms ease',
                  }}>
                    <Card padding={0}>
                      {events.map((e, i) => (
                        <div key={i}>
                          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <TimelineDot type={e.type} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                ...baseText, fontSize: 10, color: TOKENS.inkMuted,
                                letterSpacing: '0.08em', textTransform: 'uppercase',
                              }}>{typeLabel[e.type]}</div>
                              <div style={{
                                ...baseText, fontSize: 13.5, color: TOKENS.ink,
                                marginTop: 2, letterSpacing: '-0.012em', lineHeight: 1.35,
                              }}>{e.title}</div>
                              {e.meta && (
                                <div style={{
                                  ...baseText, fontSize: 11, color: TOKENS.inkMuted,
                                  marginTop: 2, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.005em',
                                }}>{e.meta}</div>
                              )}
                            </div>
                            <div style={{
                              ...baseText, fontSize: 11, color: TOKENS.inkMuted,
                              fontVariantNumeric: 'tabular-nums', flexShrink: 0,
                              paddingTop: 2, letterSpacing: '-0.005em',
                            }}>{e.time !== '00:00' ? e.time : ''}</div>
                          </div>
                          {i < events.length - 1 && <Divider inset={30} />}
                        </div>
                      ))}
                    </Card>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

function TimelineDot({ type }) {
  const c = {
    food: TOKENS.amber, weight: TOKENS.sage, obs: TOKENS.rose, plan: TOKENS.inkMuted,
  }[type];
  return (
    <div style={{
      width: 7, height: 7, borderRadius: 4,
      background: c, marginTop: 7, flexShrink: 0,
    }} />
  );
}

window.ObservationerScreen = ObservationerScreen;
window.ObsNewScreen = ObsNewScreen;
window.TidslinjeScreen = TidslinjeScreen;
