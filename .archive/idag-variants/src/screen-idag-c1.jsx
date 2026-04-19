// Idag — Variant C.1: full-bleed photo, single long cream gradient starting
// just above Vega name. Photo fades naturally into cream — no floating card,
// no dark scrim below the name. Content flows on the gradient.

function IdagScreen({ app, onOpenLogger, onOpenProfile }) {
  const planTotal = app.plan.length;
  const planDoneCount = app.plan.filter(p => app.planDone[p.id]).length;

  const today = new Date();
  const months = ['januar','februar','marts','april','maj','juni','juli','august','september','oktober','november','december'];
  const weekdays = ['søndag','mandag','tirsdag','onsdag','torsdag','fredag','lørdag'];
  const dateStr = `${weekdays[today.getDay()].toUpperCase()} · ${today.getDate()}. ${months[today.getMonth()]}`;

  const nextMissed = app.plan.find(p => !app.planDone[p.id]);
  const statusStr = nextMissed ? `${nextMissed.label} kl. ${nextMissed.time} mangler` : 'Alle opgaver klaret i dag';

  return (
    <div style={{
      position: 'relative', height: '100%',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* === Photo — full bleed behind everything === */}
      <FullBleedC1 show={app.showPhoto} />

      {/* === Local dark halo behind Vega+status — soft oval, not horizontal band === */}
      <div style={{
        position: 'absolute', left: 0, right: 0,
        top: 280, height: 160,
        background: `radial-gradient(ellipse 280px 90px at 110px 80px,
          rgba(20,14,10,0.32) 0%,
          rgba(20,14,10,0.22) 35%,
          rgba(20,14,10,0.1) 70%,
          rgba(20,14,10,0) 100%)`,
        zIndex: 2, pointerEvents: 'none',
      }} />

      {/* === Cream gradient for lower half — isolated ===
           Starts high behind the Vega area with a very gentle lift so the
           photo's bottom half brightens softly. The dark halo handles local
           contrast for Vega's name/status. Reaches near-solid cream by the
           Dagens plan label (~y=320) so the section header sits on clean
           cream, not in the transition zone. */}
      <div style={{
        position: 'absolute', left: 0, right: 0,
        top: 180, bottom: 0,
        background: `linear-gradient(180deg,
          rgba(244,239,231,0) 0%,
          rgba(244,239,231,0.02) 10%,
          rgba(244,239,231,0.05) 17%,
          rgba(244,239,231,0.12) 22%,
          rgba(244,239,231,0.25) 26%,
          rgba(244,239,231,0.45) 30%,
          rgba(244,239,231,0.7) 34%,
          rgba(244,239,231,0.9) 38%,
          ${TOKENS.bg} 42%,
          ${TOKENS.bg} 100%)`,
        zIndex: 2, pointerEvents: 'none',
      }} />

      {/* === Foreground content === */}
      <div style={{
        position: 'relative', zIndex: 3,
        display: 'flex', flexDirection: 'column',
        flex: 1, minHeight: 0,
      }}>
        {/* Date — top left, white on photo */}
        <div style={{ padding: '18px 24px 0', flexShrink: 0 }}>
          <div style={{
            ...baseText, fontSize: 10.5, fontWeight: 600,
            color: 'rgba(255,255,255,0.92)', letterSpacing: '0.16em',
            textShadow: '0 1px 8px rgba(0,0,0,0.35)',
          }}>{dateStr}</div>
        </div>

        {/* Spacer — Vega sits ~40% down the photo area, leaving room below
             for a long, soft cream transition before the Dagens plan label. */}
        <div style={{ flex: '0 0 280px' }} />

        {/* Vega + status — sits in the photo area, with breathing room below
             so the cream gradient has space for a long, soft transition
             before the Dagens plan label. */}
        <button onClick={onOpenProfile} style={{
          background: 'transparent', border: 'none',
          padding: '0 20px 90px', cursor: 'pointer', textAlign: 'left',
          flexShrink: 0,
        }}>
          <div style={{
            ...baseText, fontSize: 38, fontWeight: 600,
            color: '#fffaf2', letterSpacing: '-0.035em', lineHeight: 1,
            textShadow: '0 2px 16px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)',
          }}>Vega</div>
          <div style={{
            ...baseText, marginTop: 6, fontSize: 13, fontWeight: 450,
            color: 'rgba(255,250,242,0.92)', letterSpacing: '-0.005em',
            textShadow: '0 1px 8px rgba(0,0,0,0.4)',
          }}>{statusStr}</div>
        </button>

        {/* Dagens plan */}
        <div style={{
          padding: '4px 20px 12px',
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
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, height: 24,
              background: `linear-gradient(180deg, rgba(250,246,240,0) 0%, ${TOKENS.surface} 100%)`,
              pointerEvents: 'none', borderRadius: '0 0 16px 16px',
            }} />
          </div>
        </div>

        {/* Hurtig log */}
        <div style={{ padding: '8px 20px 16px', flexShrink: 0 }}>
          <div style={{ padding: '0 6px 10px' }}>
            <SectionLabel>Hurtig log</SectionLabel>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[['Foder','foder-log'],['Vægt','vaegt-log'],['Obs.','obs-new']].map(([label, screen]) => (
              <button key={label} onClick={() => onOpenLogger(screen)} style={{
                ...baseText,
                background: TOKENS.surface, border: `0.5px solid ${TOKENS.line}`,
                borderRadius: 16, padding: '14px 8px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14">
                  <path d="M7 2v10M2 7h10" stroke={TOKENS.ink} strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize: 13, fontWeight: 450, color: TOKENS.ink, letterSpacing: '-0.01em' }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FullBleedC1({ show }) {
  if (!show) {
    return (
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: `linear-gradient(180deg, ${TOKENS.amberTint} 0%, ${TOKENS.bg} 100%)`,
      }} />
    );
  }
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(assets/vega-hero.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: '50% 25%',
      }} />
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 100,
        background: `linear-gradient(180deg,
          rgba(20,14,10,0.4) 0%,
          rgba(20,14,10,0.12) 60%,
          rgba(20,14,10,0) 100%)`,
      }} />
    </div>
  );
}

window.IdagScreen = IdagScreen;
