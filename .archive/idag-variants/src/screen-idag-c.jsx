// Idag — home screen. Variant C: full 9:16 photo fills the entire phone.
// Text overlays (date, name, stats) sit on top with dark gradient scrims.
// Plan card and quick-log pills float as solid cream surfaces on the photo.

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
      {/* === HERO PHOTO — full 9:16, fills the entire phone === */}
      <FullBleedPhoto show={app.showPhoto} />

      {/* === Foreground content === */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column',
        flex: 1, minHeight: 0,
      }}>
        {/* Hero area — date top-left, name+stats bottom-left, both on dark scrims */}
        <div style={{ position: 'relative', height: 340, flexShrink: 0 }}>
          {/* Date micro-label — top-left, light on photo */}
          <div style={{ padding: '18px 24px 0' }}>
            <div style={{
              ...baseText, fontSize: 10.5, fontWeight: 600,
              color: 'rgba(255,255,255,0.92)', letterSpacing: '0.16em',
              textShadow: '0 1px 8px rgba(0,0,0,0.35)',
            }}>{dateStr}</div>
          </div>

          {/* Bottom scrim — overflows 50px below hero boundary to kill hard line */}
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: -50,
            height: 210,
            background: `linear-gradient(180deg,
              rgba(20,14,10,0) 0%,
              rgba(20,14,10,0.22) 40%,
              rgba(20,14,10,0.45) 68%,
              rgba(20,14,10,0.45) 76%,
              rgba(20,14,10,0) 100%)`,
            pointerEvents: 'none',
          }} />

          {/* Name + age · weight — anchored bottom-left, white */}
          <button onClick={onOpenProfile} style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            background: 'transparent', border: 'none',
            padding: '20px 20px 18px', cursor: 'pointer',
            textAlign: 'left',
          }}>
            <div style={{
              ...baseText, fontSize: 40, fontWeight: 600,
              color: '#fffaf2', letterSpacing: '-0.035em', lineHeight: 1,
              textShadow: '0 2px 16px rgba(0,0,0,0.35)',
            }}>Vega</div>
            <div style={{
              ...baseText, marginTop: 8, fontSize: 12.5, fontWeight: 500,
              color: 'rgba(255,250,242,0.88)', letterSpacing: '0.04em',
              fontVariantNumeric: 'tabular-nums',
              textShadow: '0 1px 8px rgba(0,0,0,0.35)',
            }}>{ageStr} · {weightStr}</div>
          </button>
        </div>

        {/* === Dagens plan — floating cream card on photo === */}
        <div style={{
          padding: '14px 20px 12px',
          display: 'flex', flexDirection: 'column',
          flex: 1, minHeight: 0,
          background: 'transparent',
        }}>
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            padding: '0 6px 10px', flexShrink: 0,
          }}>
            <SectionLabel style={{
              color: 'rgba(255,250,242,0.88)',
              textShadow: '0 1px 6px rgba(0,0,0,0.35)',
            }}>Dagens plan</SectionLabel>
            <span style={{
              ...baseText, fontSize: 11,
              color: 'rgba(255,250,242,0.78)',
              letterSpacing: '0.02em', fontVariantNumeric: 'tabular-nums',
              textShadow: '0 1px 6px rgba(0,0,0,0.35)',
            }}>{planDoneCount}/{planTotal}</span>
          </div>
          <div style={{
            position: 'relative', flex: 1, minHeight: 0,
            background: TOKENS.surface, borderRadius: 16,
            border: `0.5px solid ${TOKENS.line}`,
            boxShadow: '0 8px 32px rgba(20,14,10,0.18), 0 2px 8px rgba(20,14,10,0.10)',
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
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, height: 24,
              background: `linear-gradient(180deg, rgba(250,246,240,0) 0%, ${TOKENS.surface} 100%)`,
              pointerEvents: 'none', borderRadius: '0 0 16px 16px',
            }} />
          </div>
        </div>

        {/* === Hurtig log — cream pills floating on photo === */}
        <div style={{ padding: '8px 20px 16px', flexShrink: 0, background: 'transparent' }}>
          <div style={{ padding: '0 6px 10px' }}>
            <SectionLabel style={{
              color: 'rgba(255,250,242,0.88)',
              textShadow: '0 1px 6px rgba(0,0,0,0.35)',
            }}>Hurtig log</SectionLabel>
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

// Full-bleed photo — fills the entire phone screen behind all content.
// Top scrim ensures date + status bar stay legible. Photo itself is untouched
// in the middle and fades subtly at the very bottom so the tab bar reads.
function FullBleedPhoto({ show }) {
  if (!show) {
    return (
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: `linear-gradient(180deg,
          ${TOKENS.amberTint} 0%,
          ${TOKENS.surfaceAlt} 60%,
          ${TOKENS.bg} 100%)`,
      }} />
    );
  }
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
      overflow: 'hidden',
    }}>
      {/* Photo — fills entire phone */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(assets/vega-hero.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: '50% 30%',
      }} />
      {/* Top scrim — darker behind status bar + date so they pop */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 120,
        background: `linear-gradient(180deg,
          rgba(20,14,10,0.45) 0%,
          rgba(20,14,10,0.18) 55%,
          rgba(20,14,10,0) 100%)`,
      }} />
      {/* Bottom scrim — long fade, photo fully gone before tab bar */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: 320,
        background: `linear-gradient(180deg,
          rgba(244,239,231,0) 0%,
          rgba(244,239,231,0.15) 25%,
          rgba(244,239,231,0.5) 50%,
          rgba(244,239,231,0.85) 70%,
          ${TOKENS.bg} 85%,
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
      boxShadow: '0 4px 16px rgba(20,14,10,0.14)',
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
