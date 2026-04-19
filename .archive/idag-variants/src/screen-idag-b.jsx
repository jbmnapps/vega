// Idag — Variant B: text sits on clean cream at top, photo is a pure strip below.
// No text ever touches the photo. Plan card on cream below.

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
      height: '100%', display: 'flex', flexDirection: 'column',
      background: TOKENS.bg, overflow: 'hidden',
    }}>

      {/* === Header — cream, text only === */}
      <button onClick={onOpenProfile} style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        textAlign: 'left', padding: '18px 24px 16px', flexShrink: 0,
      }}>
        <div style={{
          ...baseText, fontSize: 10.5, fontWeight: 500,
          color: TOKENS.ink, letterSpacing: '0.16em', opacity: 0.7,
          marginBottom: 14,
        }}>{dateStr}</div>
        <div style={{
          ...baseText, fontSize: 38, fontWeight: 600,
          color: TOKENS.ink, letterSpacing: '-0.035em', lineHeight: 1,
        }}>Vega</div>
        <div style={{
          ...baseText, marginTop: 7, fontSize: 13, fontWeight: 450,
          color: TOKENS.inkSoft, letterSpacing: '-0.005em',
        }}>{statusStr}</div>
      </button>

      {/* === Photo strip — pure, no overlays, no text === */}
      <div style={{
        flexShrink: 0, width: '100%', height: 200,
        overflow: 'hidden', position: 'relative',
      }}>
        {app.showPhoto ? (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'url(assets/vega-hero.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: '50% 28%',
          }} />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(180deg, ${TOKENS.amberTint} 0%, ${TOKENS.surfaceAlt} 100%)`,
          }} />
        )}
        {/* Subtle bottom fade into bg */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: 48,
          background: `linear-gradient(180deg, rgba(244,239,231,0) 0%, ${TOKENS.bg} 100%)`,
          pointerEvents: 'none',
        }} />
      </div>

      {/* === Content — clean cream === */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        flex: 1, minHeight: 0,
        padding: '8px 20px 12px',
      }}>
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

        <div style={{ padding: '12px 0 0', flexShrink: 0 }}>
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

window.IdagScreen = IdagScreen;
