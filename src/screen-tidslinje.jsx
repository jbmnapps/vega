// Tidslinje — vertical spine of dots; tap a day to expand details inline.

function TidslinjeScreen({ app }) {
  const today = window.localISO();
  const { grouped, dates } = window.buildTimeline(app, today);

  // Focus on most recent day
  const [focusDate, setFocusDate] = React.useState(dates[0]);

  const typeLabel = { food: 'Foder', weight: 'Vægt', obs: 'Observation', plan: 'Plan' };

  return (
    <div style={{ padding: '0 0 120px' }}>
      <ScreenHeader title="Tidslinje" />

      <div style={{ padding: '4px 0 0' }}>
        {dates.map((date, di) => {
          const isFocus = date === focusDate;
          const events = grouped[date].sort((a, b) => b.time.localeCompare(a.time));
          const w = window.closestWeight(app.weights, date);
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
                              {e.note && (
                                <div style={{
                                  ...baseText, fontSize: 10.5, color: TOKENS.inkFaint,
                                  marginTop: 2, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.005em',
                                }}>{e.note}</div>
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

window.TidslinjeScreen = TidslinjeScreen;
