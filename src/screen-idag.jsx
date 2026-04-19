// Idag — Variant D: date on clean cream, photo starts below it — no top gradient.
// Photo fades into cream at the bottom. Vega + status rest on the gradient.
// Plan card and quick-log sit on clean cream below — Nordic calm preserved.

function IdagScreen({ app, onOpenLogger, onOpenProfile, onAddPost }) {
  const sortedPlan = React.useMemo(
    () => [...app.plan].sort((a, b) => a.time.localeCompare(b.time)),
    [app.plan]
  );
  const planTotal = sortedPlan.length;
  const planDoneCount = sortedPlan.filter(p => app.planDone[p.id]).length;
  const [swipeOpenId, setSwipeOpenId] = React.useState(null);

  const today = new Date();
  const months = ['januar','februar','marts','april','maj','juni','juli','august','september','oktober','november','december'];
  const weekdays = ['søndag','mandag','tirsdag','onsdag','torsdag','fredag','lørdag'];
  const dateStr = `${weekdays[today.getDay()].toUpperCase()} · ${today.getDate()}. ${months[today.getMonth()]}`;

  // Status line — identity snapshot: age + latest weight, both derived from state.
  const latestKg = app.weights[app.weights.length - 1]?.kg ?? 4.20;
  const kgStr = latestKg.toFixed(1).replace('.', ',') + ' kg';
  const ageStr = ageFromBirthdate(app.birthdate);
  const statusStr = ageStr ? `${ageStr} · ${kgStr}` : kgStr;

  return (
    <div style={{
      position: 'relative', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: TOKENS.bg,
      overflow: 'hidden',
    }}>
      {/* === Date — sits on clean cream, above the photo === */}
      <div style={{ padding: '18px 24px 12px', flexShrink: 0 }}>
        <div style={{
          ...baseText, fontSize: 10.5, fontWeight: 500,
          color: TOKENS.ink, letterSpacing: '0.16em', opacity: 0.7,
        }}>{dateStr}</div>
      </div>

      {/* === HERO — photo starts cleanly below date === */}
      <HeroD show={app.showPhoto} catName={app.catName} statusStr={statusStr} onOpenProfile={onOpenProfile} />

      {/* === Content below hero — clean cream === */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        flex: 1, minHeight: 0,
        padding: '4px 20px 12px',
      }}>
        {/* Dagens plan */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            padding: '0 6px 10px', flexShrink: 0,
          }}>
            <SectionLabel>Dagens plan</SectionLabel>
            <span style={{
              ...baseText, fontSize: 11, color: TOKENS.inkMuted,
              letterSpacing: '0.02em', fontVariantNumeric: 'tabular-nums',
            }}>{planDoneCount}/{planTotal}</span>
          </div>
          <div style={{
            position: 'relative', flex: 1, minHeight: 0,
            background: TOKENS.surface, borderRadius: 16,
            border: `0.5px solid ${TOKENS.line}`,
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              overflowY: 'auto', overflowX: 'hidden',
              WebkitOverflowScrolling: 'touch',
            }}>
              {sortedPlan.map((item) => {
                const done = app.planDone[item.id];
                return (
                  <div key={item.id}>
                    <SwipeRow
                      open={swipeOpenId === item.id}
                      onOpenChange={(o) => setSwipeOpenId(o ? item.id : null)}
                      onDelete={() => { app.removePlanPost(item.id); setSwipeOpenId(null); }}
                    >
                      <div
                        onClick={() => {
                          if (swipeOpenId === item.id) { setSwipeOpenId(null); return; }
                          if (item.kind === 'food' && !done) onOpenLogger('foder-log');
                          else app.togglePlan(item.id);
                        }}
                        style={{
                          display: 'flex', alignItems: 'center',
                          padding: '11px 18px', gap: 14, cursor: 'pointer',
                          background: TOKENS.surface,
                        }}
                      >
                        <PlanCheck checked={done} onClick={(e) => { e.stopPropagation(); app.togglePlan(item.id); }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            ...baseText, fontSize: 16, fontWeight: 450,
                            color: done ? TOKENS.inkMuted : TOKENS.ink,
                            letterSpacing: '-0.01em',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>{item.label}</div>
                          {planDetail(item, app.products) && (
                            <div style={{
                              ...baseText, fontSize: 12, marginTop: 3,
                              color: TOKENS.inkMuted, letterSpacing: '-0.005em',
                              fontVariantNumeric: 'tabular-nums',
                            }}>{planDetail(item, app.products)}</div>
                          )}
                        </div>
                        <div style={{
                          ...baseText, fontSize: 14,
                          color: TOKENS.inkMuted, fontVariantNumeric: 'tabular-nums',
                          letterSpacing: '-0.005em',
                        }}>kl. {item.time}</div>
                      </div>
                    </SwipeRow>
                    <Divider inset={52} />
                  </div>
                );
              })}
              <div
                onClick={onAddPost}
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: '11px 18px', gap: 14, cursor: 'pointer',
                }}
              >
                <AddGlyph />
                <div style={{
                  ...baseText, flex: 1, fontSize: 16, fontWeight: 450,
                  color: TOKENS.inkMuted, letterSpacing: '-0.01em',
                }}>Tilføj</div>
              </div>
            </div>
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, height: 24,
              background: `linear-gradient(180deg, rgba(250,246,240,0) 0%, ${TOKENS.surface} 100%)`,
              pointerEvents: 'none', borderRadius: '0 0 16px 16px',
            }} />
          </div>
        </div>

        {/* Hurtig log */}
        <div style={{ padding: '12px 0 0', flexShrink: 0 }}>
          <div style={{ padding: '0 6px 10px' }}>
            <SectionLabel>Hurtig log</SectionLabel>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <QuickActionD label="Foder" onClick={() => onOpenLogger('foder-log')} />
            <QuickActionD label="Vægt" onClick={() => onOpenLogger('vaegt-log')} />
            <QuickActionD label="Obs." onClick={() => onOpenLogger('obs-new')} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Photo starts cleanly — no top gradient. Bottom gradient is long and unhurried,
// fully opaque cream before Vega+status so warm ink always reads.
function HeroD({ show, catName, statusStr, onOpenProfile }) {
  const HERO_H = 380;

  return (
    <div style={{
      position: 'relative', width: '100%', height: HERO_H,
      flexShrink: 0, overflow: 'hidden',
      background: TOKENS.amberTint,
    }}>
      {show && (
        <React.Fragment>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'url(assets/vega-hero.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: '50% 22%',
            // Subtle premium lift: a touch more contrast + warmth, no heavy-handed edits.
            filter: 'contrast(1.04) saturate(1.08) brightness(1.02)',
          }} />
          {/* Fine film grain — SVG turbulence, very low opacity, soft-light blend.
              Adds perceived sharpness and texture without being visible as noise. */}
          <svg style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            opacity: 0.09, mixBlendMode: 'soft-light', pointerEvents: 'none',
          }}>
            <filter id="heroGrain">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#heroGrain)" />
          </svg>
        </React.Fragment>
      )}

      {/* Bottom fade — starts at 50% height, unhurried, fully cream by bottom */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: 220,
        background: `linear-gradient(180deg,
          rgba(244,239,231,0) 0%,
          rgba(244,239,231,0.3) 30%,
          rgba(244,239,231,0.7) 60%,
          rgba(244,239,231,0.95) 82%,
          ${TOKENS.bg} 100%)`,
        pointerEvents: 'none',
      }} />

      {/* Vega + status — bottom-left, on fully opaque cream gradient */}
      <button onClick={onOpenProfile} style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: 'transparent', border: 'none',
        padding: '16px 20px 20px', cursor: 'pointer', textAlign: 'left',
      }}>
        <div style={{
          ...baseText, fontSize: 38, fontWeight: 600,
          color: TOKENS.ink, letterSpacing: '-0.035em', lineHeight: 1,
        }}>{catName}</div>
        <div style={{
          ...baseText, marginTop: 6, fontSize: 13, fontWeight: 450,
          color: TOKENS.inkSoft, letterSpacing: '-0.005em',
        }}>{statusStr}</div>
      </button>
    </div>
  );
}

// Circle glyph matching PlanCheck's footprint, with a + sign inside.
// Signals "add" without aggressive filled-green iOS style — stays Nordic calm.
function AddGlyph() {
  return (
    <div style={{
      width: 24, height: 24, borderRadius: 12,
      border: `1px dashed ${TOKENS.lineStrong}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <svg width="10" height="10" viewBox="0 0 10 10">
        <path d="M5 1v8M1 5h8" fill="none" stroke={TOKENS.inkMuted}
          strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function QuickActionD({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      ...baseText,
      background: TOKENS.surface, border: `0.5px solid ${TOKENS.line}`,
      borderRadius: 16, padding: '14px 8px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
      cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14">
        <path d="M7 2v10M2 7h10" stroke={TOKENS.ink} strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
      <span style={{
        fontSize: 13, fontWeight: 450, color: TOKENS.ink,
        letterSpacing: '-0.01em',
      }}>{label}</span>
    </button>
  );
}

// Detaljelinje under label — kcal (mad), min (aktivitet), dose+unit (medicin).
// Returnerer tom streng hvis detaljer mangler.
function planDetail(item, products) {
  const d = item.details;
  if (!d) return '';
  if (item.category === 'mad') {
    const p = products.find(x => x.id === d.productId);
    if (p && p.kcal100 != null && d.grams) {
      return `${Math.round((p.kcal100 / 100) * d.grams)} kcal`;
    }
    if (d.grams) return `${d.grams} g`;
    return '';
  }
  if (item.category === 'aktivitet' && d.minutes) return `${d.minutes} min`;
  if (item.category === 'medicin' && d.dose != null) {
    return `${d.dose} ${d.unit || ''}`.trim();
  }
  return '';
}

// Swipe-til-venstre afslører en "Slet"-knap bagved.
// Tærskel: > 40px → snap åben (-80), ellers snap tilbage.
function SwipeRow({ children, onDelete, open, onOpenChange }) {
  const [startX, setStartX] = React.useState(null);
  const [dx, setDx] = React.useState(0);
  const moved = React.useRef(false);

  const baseOffset = open ? -80 : 0;
  const live = startX !== null ? baseOffset + dx : baseOffset;
  const clamped = Math.max(-100, Math.min(0, live));

  const onDown = (e) => {
    setStartX(e.clientX);
    setDx(0);
    moved.current = false;
  };
  const onMove = (e) => {
    if (startX === null) return;
    const d = e.clientX - startX;
    if (Math.abs(d) > 4) moved.current = true;
    setDx(d);
  };
  const onUp = () => {
    if (startX === null) return;
    const final = baseOffset + dx;
    onOpenChange(final < -40);
    setStartX(null);
    setDx(0);
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: TOKENS.danger }}>
      <button
        onClick={onDelete}
        style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: 80,
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: '#fff', fontSize: 14, fontWeight: 500,
          letterSpacing: '-0.005em', fontFamily: 'inherit',
        }}
      >Slet</button>
      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onClickCapture={(e) => { if (moved.current) { e.stopPropagation(); e.preventDefault(); moved.current = false; } }}
        style={{
          position: 'relative',
          transform: `translateX(${clamped}px)`,
          transition: startX !== null ? 'none' : 'transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          touchAction: 'pan-y',
        }}
      >{children}</div>
    </div>
  );
}

window.IdagScreen = IdagScreen;
