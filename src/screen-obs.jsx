// Observationer — canvas-first (blank-per-day) with toggle to a flat list.

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
  const today = window.localISO();
  const [date, setDate] = React.useState(today);
  const [text, setText] = React.useState('');
  const [showAllVocab, setShowAllVocab] = React.useState(false);
  const [swipeOpenId, setSwipeOpenId] = React.useState(null);

  const dayObs = app.observations.filter(o => o.date === date).sort((a, b) => a.time.localeCompare(b.time));

  const submit = () => {
    if (!text.trim()) return;
    app.addObservation(text.trim(), date);
    setText('');
    // Stay on selected day — user may want to add more to same past day.
  };

  const isToday = date === today;

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '0 0 40px' }}>
      <DaySwiper date={date} onChange={setDate} />

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
            placeholder={isToday ? 'Hvad lagde du mærke til?' : 'Noter for denne dag…'}
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

        {/* Vocab quick-pick — filtered by what the user is typing */}
        {app.vocab.length > 0 && (() => {
          const q = text.trim().toLowerCase();
          const filtered = q ? app.vocab.filter(v => v.toLowerCase().includes(q)) : app.vocab;
          if (filtered.length === 0) return null;
          return (
            <VocabRow
              filtered={filtered}
              onPick={setText}
              expanded={showAllVocab}
              onToggleExpand={() => setShowAllVocab(s => !s)}
            />
          );
        })()}
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
                <window.SwipeRow
                  open={swipeOpenId === o.id}
                  onOpenChange={(open) => setSwipeOpenId(open ? o.id : null)}
                  onDelete={() => { app.removeObservation(o.id); setSwipeOpenId(null); }}
                >
                  <div style={{ padding: '14px 18px', background: TOKENS.surface }}>
                    <div style={{ ...baseText, fontSize: 14, color: TOKENS.ink, letterSpacing: '-0.01em', lineHeight: 1.45 }}>{o.text}</div>
                    <div style={{ ...baseText, fontSize: 11, color: TOKENS.inkMuted, marginTop: 3, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.005em' }}>kl. {o.time}</div>
                  </div>
                </window.SwipeRow>
                {i < dayObs.length - 1 && <Divider inset={18} />}
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}

// Chips-række der clamper til max 2 linjer. Måler off-screen hvor mange chips
// (+ evt. "Vis flere"-knap) der passer, og viser derefter den tilsvarende slice.
function VocabRow({ filtered, onPick, expanded, onToggleExpand }) {
  const measureRef = React.useRef(null);
  const [visibleCount, setVisibleCount] = React.useState(filtered.length);
  const [hasOverflow, setHasOverflow] = React.useState(false);

  const chipStyle = {
    ...baseText, padding: '7px 12px', borderRadius: 8,
    background: TOKENS.surface, border: `0.5px solid ${TOKENS.line}`,
    color: TOKENS.inkSoft, fontSize: 12, cursor: 'pointer', letterSpacing: '-0.01em',
    whiteSpace: 'nowrap',
  };
  const moreStyle = {
    ...baseText, padding: '7px 12px', borderRadius: 8,
    background: 'transparent', border: `0.5px dashed ${TOKENS.line}`,
    color: TOKENS.inkMuted, fontSize: 12, cursor: 'pointer', letterSpacing: '-0.01em',
    whiteSpace: 'nowrap',
  };

  React.useLayoutEffect(() => {
    if (expanded) {
      setVisibleCount(filtered.length);
      setHasOverflow(filtered.length > 0 && true); // keep "Vis færre" button visible
      return;
    }
    const el = measureRef.current;
    if (!el) return;
    const children = Array.from(el.children);
    if (children.length === 0) return;

    // Find how many children fit in first 2 rows (distinct offsetTop values)
    const tops = [];
    let fitCount = 0;
    for (const c of children) {
      const t = c.offsetTop;
      if (!tops.includes(t)) {
        if (tops.length === 2) break;
        tops.push(t);
      }
      fitCount++;
    }

    // Measurement children = filtered chips + "Vis flere"-placeholder (last)
    const allFit = fitCount >= children.length;
    if (allFit) {
      setVisibleCount(filtered.length);
      setHasOverflow(false);
    } else {
      // Not everything fits. Last measurement child is "Vis flere" button.
      // If button is among the fitting ones, great. If not, we subtract it
      // since we still want to keep the button in the final render.
      // The measurement already includes the button at index filtered.length,
      // so fitCount minus (1 if button didn't fit) gives chip count.
      const buttonFit = fitCount > filtered.length;
      const chipFit = buttonFit ? fitCount - 1 : fitCount - 1;
      // Ensure at least 0
      setVisibleCount(Math.max(0, chipFit));
      setHasOverflow(true);
    }
  }, [filtered, expanded]);

  const visible = expanded ? filtered : filtered.slice(0, visibleCount);
  const hiddenCount = filtered.length - visibleCount;

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ ...baseText, fontSize: 10.5, color: TOKENS.inkMuted, textTransform: 'uppercase', letterSpacing: '0.14em', padding: '0 4px 8px' }}>
        Tidligere
      </div>

      {/* Off-screen measurement — renders all chips + a placeholder "Vis flere" */}
      <div
        ref={measureRef}
        aria-hidden="true"
        style={{
          display: 'flex', flexWrap: 'wrap', gap: 6,
          position: 'absolute', visibility: 'hidden', pointerEvents: 'none',
          left: 0, right: 0, padding: '0 20px',
        }}
      >
        {filtered.map((v, i) => (
          <span key={i} style={chipStyle}>{v}</span>
        ))}
        <span style={moreStyle}>{`Vis flere (${filtered.length})`}</span>
      </div>

      {/* Visible row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {visible.map((v, i) => (
          <button key={i} onClick={() => onPick(v)} style={chipStyle}>{v}</button>
        ))}
        {(hasOverflow || expanded) && (
          <button onClick={onToggleExpand} style={moreStyle}>
            {expanded ? 'Vis færre' : `Vis flere (${hiddenCount})`}
          </button>
        )}
      </div>
    </div>
  );
}

// List view — chronological stream grouped by date, as before.
function ObsList({ app }) {
  const [swipeOpenId, setSwipeOpenId] = React.useState(null);
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
                <window.SwipeRow
                  open={swipeOpenId === o.id}
                  onOpenChange={(open) => setSwipeOpenId(open ? o.id : null)}
                  onDelete={() => { app.removeObservation(o.id); setSwipeOpenId(null); }}
                >
                  <div style={{ padding: '14px 18px', background: TOKENS.surface }}>
                    <div style={{ ...baseText, fontSize: 14, color: TOKENS.ink, letterSpacing: '-0.01em', lineHeight: 1.45 }}>{o.text}</div>
                    <div style={{ ...baseText, fontSize: 11, color: TOKENS.inkMuted, marginTop: 3, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.005em' }}>kl. {o.time}</div>
                  </div>
                </window.SwipeRow>
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

window.ObservationerScreen = ObservationerScreen;
window.ObsNewScreen = ObsNewScreen;
