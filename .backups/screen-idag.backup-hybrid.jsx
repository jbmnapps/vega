// Idag — home screen. Non-scrollable page; plan card scrolls internally.
// Full-bleed photo backdrop that fades softly at top and into cream before
// the plan header, so UI labels sit on clean cream.

function IdagScreen({ app, onOpenLogger, onOpenProfile }) {
  const planTotal = app.plan.length;
  const planDoneCount = app.plan.filter(p => app.planDone[p.id]).length;

  const today = new Date();
  const months = ['januar','februar','marts','april','maj','juni','juli','august','september','oktober','november','december'];
  const weekdays = ['søndag','mandag','tirsdag','onsdag','torsdag','fredag','lørdag'];
  const dateStr = `${weekdays[today.getDay()].toUpperCase()} · ${today.getDate()}. ${months[today.getMonth()]}`;

  const ageStr = '1 år 3 mdr';
  const latestW = app.weights[app.weights.length - 1];
  const weightStr = `${latestW.kg.toFixed(1).replace('.', ',')} kg`;

  return (
    <div style={{
      position: 'relative', height: '100%',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* === HERO PHOTO — full-bleed backdrop === */}
      <HeroPhoto show={app.showPhoto} />

      {/* === Foreground content === */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column',
        flex: 1, minHeight: 0,
      }}>
        {/* Hero area — date top-left, name+stats bottom-left over subtle scrim */}
        <div style={{ position: 'relative', height: 310, flexShrink: 0 }}>
          {/* Date micro-label — top-left */}
          <div style={{ padding: '18px 24px 0' }}>
            <div style={{
              ...baseText, fontSize: 10.5, fontWeight: 500,
              color: TOKENS.ink, letterSpacing: '0.16em', opacity: 0.7,
            }}>{dateStr}</div>
          </div>

          {/* Caption scrim behind name+stats — a thin horizontal cream band */}
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            height: 120,
            background: `linear-gradient(180deg,
              rgba(244,239,231,0) 0%,
              rgba(244,239,231,0.35) 55%,
              rgba(244,239,231,0.72) 100%)`,
            pointerEvents: 'none',
          }} />

          {/* Name + age · weight — anchored bottom-left */}
          <button onClick={onOpenProfile} style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            background: 'transparent', border: 'none',
            padding: '20px 20px 16px', cursor: 'pointer',
            textAlign: 'left',
          }}>
            <div style={{
              ...baseText, fontSize: 38, fontWeight: 600,
              color: TOKENS.ink, letterSpacing: '-0.035em', lineHeight: 1,
            }}>Vega</div>
            <div style={{
              ...baseText, marginTop: 6, fontSize: 12.5, fontWeight: 500,
              color: TOKENS.inkSoft, letterSpacing: '0.04em',
              fontVariantNumeric: 'tabular-nums',
            }}>{ageStr} · {weightStr}</div>
          </button>
        </div>

        {/* === Dagens plan — fills remaining space; card scrolls internally === */}
        <div style={{
          padding: '14px 20px 12px',
          display: 'flex', flexDirection: 'column',
          flex: 1, minHeight: 0,
        }}>
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
              {app.plan.map((item, i) => {
                const done = app.planDone[item.id];
                return (
                  <div key={item.id}>
                    <div
                      onClick={() => {
                        if (item.kind === 'food' && !done) onOpenLogger('foder-log');
                        else app.togglePlan(item.id);
                      }}
                      style={{
                        display: 'flex', alignItems: 'center',
                        padding: '15px 18px', gap: 14, cursor: 'pointer',
                      }}
                    >
                      <PlanCheck checked={done} onClick={(e) => { e.stopPropagation(); app.togglePlan(item.id); }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          ...baseText, fontSize: 16, fontWeight: 450,
                          color: done ? TOKENS.inkMuted : TOKENS.ink,
                          textDecoration: done ? 'line-through' : 'none',
                          textDecorationColor: TOKENS.inkFaint,
                          letterSpacing: '-0.01em',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{item.label}</div>
                      </div>
                      <div style={{
                        ...baseText, fontSize: 14,
                        color: TOKENS.inkMuted, fontVariantNumeric: 'tabular-nums',
                        letterSpacing: '-0.005em',
                      }}>kl. {item.time}</div>
                    </div>
                    {i < app.plan.length - 1 && <Divider inset={52} />}
                  </div>
                );
              })}
            </div>
            {/* Subtle bottom fade — hints at scrollability when list overflows */}
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, height: 24,
              background: `linear-gradient(180deg, rgba(250,246,240,0) 0%, ${TOKENS.surface} 100%)`,
              pointerEvents: 'none', borderRadius: '0 0 16px 16px',
            }} />
          </div>
        </div>

        {/* === Hurtig log — fixed-height pills === */}
        <div style={{ padding: '8px 20px 16px', flexShrink: 0 }}>
          <div style={{ padding: '0 6px 10px' }}>
            <SectionLabel>Hurtig log</SectionLabel>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <QuickAction label="Foder" onClick={() => onOpenLogger('foder-log')} />
            <QuickAction label="Vægt" onClick={() => onOpenLogger('vaegt-log')} />
            <QuickAction label="Obs." onClick={() => onOpenLogger('obs-new')} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Hero backdrop — full-bleed photo with soft fades at top (into cream above
// the status bar) and before the plan header (so labels sit on pure cream).
// Still visible around the sides of cards lower down.
function HeroPhoto({ show }) {
  const HERO_H = 360; // fades to full cream just before Dagens plan label
  if (!show) {
    return (
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: HERO_H, zIndex: 1, pointerEvents: 'none',
        background: `linear-gradient(180deg,
          ${TOKENS.amberTint} 0%,
          ${TOKENS.amberTint} 50%,
          ${TOKENS.surfaceAlt} 80%,
          ${TOKENS.bg} 100%)`,
      }} />
    );
  }
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      height: HERO_H, zIndex: 1, pointerEvents: 'none',
      overflow: 'hidden',
    }}>
      {/* Photo — full-bleed to the very top */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(assets/vega-hero.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: '50% 30%',
      }} />
      {/* Top soft fade — photo melts into cream above status bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 80,
        background: `linear-gradient(180deg,
          ${TOKENS.bg} 0%,
          rgba(244,239,231,0.7) 35%,
          rgba(244,239,231,0.3) 70%,
          rgba(244,239,231,0) 100%)`,
      }} />
      {/* Bottom strong fade — photo is fully cream before plan header */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: 130,
        background: `linear-gradient(180deg,
          rgba(244,239,231,0) 0%,
          rgba(244,239,231,0.5) 40%,
          rgba(244,239,231,0.88) 75%,
          ${TOKENS.bg} 100%)`,
      }} />
    </div>
  );
}

function QuickAction({ label, onClick }) {
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

window.IdagScreen = IdagScreen;
