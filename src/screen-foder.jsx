// Foder — food tracking. Product library + logs. Kcal is optional.

function FoderScreen({ app, onOpenLogger }) {
  const today = window.localISO();
  const [date, setDate] = React.useState(today);
  const isToday = date === today;
  const logged = window.kcalForDate(app.products, app.foodLog, date);
  const hasTarget = typeof app.kcalTarget === 'number' && app.kcalTarget > 0;
  const remaining = hasTarget ? app.kcalTarget - logged : 0;
  const dayLogs = app.foodLog
    .filter(l => l.date === date)
    .sort((a, b) => a.time.localeCompare(b.time));
  const dayLabel = isToday ? 'I dag' : formatDanishDate(date, true);

  return (
    <div style={{ padding: '0 0 120px' }}>
      <ScreenHeader title="Foder" />

      <DaySwiper date={date} onChange={setDate} />

      <div style={{ padding: '0 20px 24px' }}>
        <Card padding={24}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <KcalRing logged={logged} target={app.kcalTarget} />
            <div style={{ flex: 1 }}>
              <div style={{ ...baseText, fontSize: 13, color: TOKENS.inkMuted, letterSpacing: '-0.005em' }}>{dayLabel}</div>
              <div style={{
                ...baseText, fontSize: 32, fontWeight: 450, color: TOKENS.ink,
                letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', marginTop: 2,
              }}>{logged}<span style={{ fontSize: 16, color: TOKENS.inkMuted, marginLeft: 4 }}>kcal</span></div>
              <div style={{
                ...baseText, fontSize: 13, color: TOKENS.inkMuted,
                marginTop: 6, letterSpacing: '-0.005em', fontVariantNumeric: 'tabular-nums',
              }}>
                {!hasTarget ? 'Intet dagligt mål' :
                 remaining > 0 ? `${remaining} kcal tilbage af ${app.kcalTarget}` :
                 remaining === 0 ? `Mål nået (${app.kcalTarget} kcal)` :
                 `${Math.abs(remaining)} kcal over ${app.kcalTarget}`}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ padding: '0 20px 24px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 6px 12px',
        }}>
          <SectionLabel>{dayLabel}</SectionLabel>
          <PlusAction label="Log foder" onClick={() => onOpenLogger('foder-log', { foderLogDate: date })} />
        </div>
        {dayLogs.length === 0 ? (
          <Card padding={24}>
            <div style={{ ...baseText, fontSize: 14, color: TOKENS.inkMuted, textAlign: 'center', letterSpacing: '-0.005em' }}>{isToday ? 'Intet logget i dag' : 'Intet logget'}</div>
          </Card>
        ) : (
          <Card padding={0}>
            {dayLogs.map((log, i) => {
              const product = app.products.find(p => p.id === log.productId);
              const kcal = window.kcalForLog(app.products, log);
              const hasKcal = product?.kcal100 != null;
              const originalKcal = window.originalKcalForLog(app.products, log);
              return (
                <div key={log.id}>
                  <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        ...baseText, fontSize: 15, fontWeight: 450, color: TOKENS.ink,
                        letterSpacing: '-0.012em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{product?.name}</div>
                      <div style={{
                        ...baseText, fontSize: 12, color: TOKENS.inkMuted,
                        marginTop: 3, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.005em',
                      }}>kl. {log.time} · {log.grams} g</div>
                      {originalKcal != null && (
                        <div style={{
                          ...baseText, fontSize: 11, color: TOKENS.inkFaint,
                          marginTop: 3, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.005em',
                        }}>oprindeligt {originalKcal} kcal</div>
                      )}
                    </div>
                    {hasKcal && (
                      <div style={{
                        ...baseText, fontSize: 15, fontWeight: 450, color: TOKENS.ink,
                        fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
                      }}>{kcal} kcal</div>
                    )}
                  </div>
                  {i < dayLogs.length - 1 && <Divider inset={18} />}
                </div>
              );
            })}
          </Card>
        )}
      </div>

      <div style={{ padding: '0 20px 24px' }}>
        <Card padding={0}>
          <div
            onClick={() => onOpenLogger('produkter')}
            style={{
              padding: '16px 18px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12,
            }}
          >
            <div style={{
              ...baseText, flex: 1, fontSize: 15, fontWeight: 450, color: TOKENS.ink,
              letterSpacing: '-0.012em',
            }}>Produkter <span style={{ color: TOKENS.inkMuted, fontWeight: 400 }}>({app.products.filter(p => !p.archived).length})</span></div>
            <svg width="8" height="14" viewBox="0 0 8 14">
              <path d="M1 1l6 6-6 6" stroke={TOKENS.inkFaint} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
        </Card>
      </div>
    </div>
  );
}

// "+" action pill used beside section labels
function PlusAction({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      ...baseText, background: 'transparent', border: 'none', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 0',
      color: TOKENS.ink, fontSize: 13, fontWeight: 500, letterSpacing: '-0.01em',
    }}>
      <svg width="13" height="13" viewBox="0 0 13 13">
        <circle cx="6.5" cy="6.5" r="6" fill="none" stroke={TOKENS.ink} strokeWidth="1" />
        <path d="M6.5 3.7v5.6M3.7 6.5h5.6" stroke={TOKENS.ink} strokeWidth="1" strokeLinecap="round" />
      </svg>
      {label}
    </button>
  );
}

function KcalRing({ logged, target, size = 84 }) {
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  const hasTarget = typeof target === 'number' && target > 0;
  const pct = hasTarget ? Math.min(1, logged / target) : 0;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={hasTarget ? TOKENS.surfaceAlt : TOKENS.line} strokeWidth={hasTarget ? 3 : 1} />
        {hasTarget && (
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={TOKENS.amber} strokeWidth="3" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
            style={{ transition: 'stroke-dashoffset 500ms cubic-bezier(0.2, 0.8, 0.2, 1)' }}
          />
        )}
      </svg>
      {hasTarget && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          ...baseText, fontSize: 14, color: TOKENS.ink,
          fontVariantNumeric: 'tabular-nums', fontWeight: 450, letterSpacing: '-0.01em',
        }}>{Math.round(pct * 100)}%</div>
      )}
    </div>
  );
}

function ScreenHeader({ title, onBack, trailing }) {
  return (
    <div style={{
      padding: '18px 24px 18px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      minHeight: 56,
    }}>
      {onBack ? (
        <button onClick={onBack} style={{
          background: 'transparent', border: 'none', padding: 6, margin: -6,
          cursor: 'pointer', display: 'flex', alignItems: 'center',
        }}>
          <svg width="22" height="22" viewBox="0 0 22 22">
            <path d="M14 5l-7 6 7 6" fill="none" stroke={TOKENS.ink}
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      ) : <div style={{ width: 22 }} />}
      <div style={{ ...baseText, fontSize: 17, fontWeight: 500, color: TOKENS.ink, letterSpacing: '-0.02em' }}>{title}</div>
      <div style={{ minWidth: 22, display: 'flex', justifyContent: 'flex-end' }}>{trailing}</div>
    </div>
  );
}

window.FoderScreen = FoderScreen;
window.ScreenHeader = ScreenHeader;
window.PlusAction = PlusAction;
