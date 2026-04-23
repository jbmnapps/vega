// Date-picker — tappable row + bottom-sheet with 14-day list.
// Used in Foder-log + Vægt-log (and Obs-log in Batch B) to allow backdating.
// Fremtidige datoer er ikke valgbare (log = hændelse, ikke plan).

function formatDateLabel(iso) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(iso); d.setHours(0, 0, 0, 0);
  const diff = Math.round((today - d) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'I dag';
  if (diff === 1) return 'I går';
  if (diff === 2) return 'I forgårs';
  return window.formatDanishDate(iso, true); // "14. apr"
}

function DateRow({ date, onOpen }) {
  const today = window.localISO();
  const isToday = date === today;
  return (
    <Card padding={0}>
      <div
        onClick={onOpen}
        style={{
          padding: '16px 18px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 12,
        }}
      >
        <div style={{
          ...baseText, flex: 1, fontSize: 15, fontWeight: 450,
          color: TOKENS.ink, letterSpacing: '-0.012em',
        }}>Dato</div>
        <div style={{
          ...baseText, fontSize: 15, fontWeight: isToday ? 400 : 500,
          color: isToday ? TOKENS.inkMuted : TOKENS.ink,
          letterSpacing: '-0.005em',
          fontVariantNumeric: 'tabular-nums',
        }}>{formatDateLabel(date)}</div>
        <svg width="8" height="14" viewBox="0 0 8 14">
          <path d="M1 1l6 6-6 6" stroke={TOKENS.inkFaint} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        </svg>
      </div>
    </Card>
  );
}

function DateSheet({ value, onSelect, onClose, daysBack = 14 }) {
  const wds = ['søndag','mandag','tirsdag','onsdag','torsdag','fredag','lørdag'];
  const days = [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = 0; i < daysBack; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    days.push(window.localISO(d));
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0, zIndex: 70,
        background: 'rgba(28, 24, 20, 0.32)',
        display: 'flex', alignItems: 'flex-end',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', background: TOKENS.bg,
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          padding: '10px 0 34px',
          maxHeight: '70%', display: 'flex', flexDirection: 'column',
          animation: 'slideUp 260ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          boxShadow: '0 -8px 30px rgba(0,0,0,0.12)',
        }}
      >
        <div style={{
          width: 36, height: 4, borderRadius: 2, background: TOKENS.lineStrong,
          margin: '6px auto 14px', opacity: 0.5,
        }} />
        <div style={{
          ...baseText, fontSize: 13, fontWeight: 500, color: TOKENS.inkMuted,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          padding: '0 24px 10px',
        }}>Vælg dato</div>
        <div style={{ flex: 1, overflow: 'auto', padding: '0 20px' }}>
          <Card padding={0}>
            {days.map((iso, i) => {
              const sel = iso === value;
              const d = new Date(iso);
              const label = formatDateLabel(iso);
              const isNamed = label === 'I dag' || label === 'I går' || label === 'I forgårs';
              const weekday = wds[d.getDay()];
              const dateStr = window.formatDanishDate(iso, true);
              return (
                <div key={iso}>
                  <div
                    onClick={() => onSelect(iso)}
                    style={{
                      padding: '14px 18px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{
                        ...baseText, fontSize: 15, fontWeight: 450,
                        color: TOKENS.ink, letterSpacing: '-0.012em',
                      }}>{isNamed ? label : weekday.charAt(0).toUpperCase() + weekday.slice(1)}</div>
                      <div style={{
                        ...baseText, fontSize: 12, color: TOKENS.inkMuted,
                        marginTop: 3, letterSpacing: '-0.005em',
                        fontVariantNumeric: 'tabular-nums',
                      }}>{isNamed ? `${weekday} · ${dateStr}` : dateStr}</div>
                    </div>
                    {sel && (
                      <svg width="16" height="16" viewBox="0 0 16 16">
                        <path d="M3 8.5l3.5 3.5L13 4.5" fill="none" stroke={TOKENS.ink}
                          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  {i < days.length - 1 && <Divider inset={18} />}
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </div>
  );
}

window.DateRow = DateRow;
window.DateSheet = DateSheet;
window.formatDateLabel = formatDateLabel;
