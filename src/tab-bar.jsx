// Bottom tab bar — Idag · Foder · Vægt · Observationer · Tidslinje
// Minimal glyphs, Nordic restraint.

const TAB_ITEMS = [
  { id: 'idag', label: 'Idag' },
  { id: 'foder', label: 'Foder' },
  { id: 'vaegt', label: 'Vægt' },
  { id: 'obs', label: 'Obs.' },
  { id: 'tid', label: 'Tidslinje' },
];

function TabIcon({ id, active }) {
  const c = active ? TOKENS.ink : TOKENS.inkMuted;
  const sw = 1.6;
  const common = { fill: 'none', stroke: c, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (id) {
    case 'idag':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8.5" {...common} />
          <circle cx="12" cy="12" r="2" fill={c} stroke="none" />
        </svg>
      );
    case 'foder':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24">
          <path d="M5 9h14l-1.5 9.5a2 2 0 01-2 1.7H8.5a2 2 0 01-2-1.7L5 9z" {...common} />
          <path d="M8 9V7a4 4 0 018 0v2" {...common} />
        </svg>
      );
    case 'vaegt':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24">
          <path d="M4 18c3-6 5-6 8-1s5 1 8-5" {...common} />
        </svg>
      );
    case 'obs':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24">
          <path d="M5 6h14M5 12h14M5 18h9" {...common} />
        </svg>
      );
    case 'tid':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8.5" {...common} />
          <path d="M12 7v5l3.5 2" {...common} />
        </svg>
      );
    default: return null;
  }
}

function TabBar({ active, onSelect }) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      height: 84, zIndex: 40,
      background: 'rgba(250, 246, 240, 0.85)',
      backdropFilter: 'blur(20px) saturate(160%)',
      WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      borderTop: `0.5px solid ${TOKENS.line}`,
      display: 'flex', alignItems: 'flex-start',
      paddingTop: 10,
    }}>
      {TAB_ITEMS.map(t => (
        <button key={t.id} onClick={() => onSelect(t.id)} style={{
          flex: 1, background: 'transparent', border: 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 4, padding: '2px 0', cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}>
          <TabIcon id={t.id} active={active === t.id} />
          <span style={{
            fontFamily: 'Inter, system-ui, sans-serif', fontSize: 10.5,
            fontWeight: 500, letterSpacing: '-0.01em',
            color: active === t.id ? TOKENS.ink : TOKENS.inkMuted,
          }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

window.TabBar = TabBar;
