// Primitive UI — buttons, inputs, avatar, card, divider.
// Muji-like restraint: tight tracking, subtle surfaces.

const baseText = {
  fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
  letterSpacing: '-0.012em',
  WebkitFontSmoothing: 'antialiased',
};

function VegaAvatar({ size = 56, showPhoto = true, bordered = false }) {
  const r = size / 2;
  if (!showPhoto) {
    // Graceful fallback — blush surface with initial
    return (
      <div style={{
        width: size, height: size, borderRadius: r,
        background: `linear-gradient(145deg, ${TOKENS.amberTint} 0%, ${TOKENS.rose} 140%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff',
        fontFamily: 'Inter, system-ui', fontWeight: 500,
        fontSize: size * 0.42, letterSpacing: '-0.02em',
        boxShadow: bordered ? `0 0 0 2px ${TOKENS.surface}, 0 0 0 2.5px ${TOKENS.lineStrong}` : 'none',
      }}>V</div>
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: r,
      backgroundImage: 'url(assets/vega-hero.jpg)',
      backgroundSize: 'cover',
      // Frame vega's face — photo is portrait, face is upper-center
      backgroundPosition: '55% 22%',
      boxShadow: bordered ? `0 0 0 2px ${TOKENS.surface}, 0 0 0 2.5px ${TOKENS.lineStrong}` : 'none',
    }} />
  );
}

function PrimaryButton({ children, onClick, disabled, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...baseText,
      height: 52, borderRadius: 14,
      background: disabled ? TOKENS.surfaceAlt : TOKENS.ink,
      color: disabled ? TOKENS.inkMuted : TOKENS.bg,
      border: 'none', fontSize: 16, fontWeight: 500,
      cursor: disabled ? 'default' : 'pointer',
      width: '100%', letterSpacing: '-0.01em',
      transition: 'transform 120ms ease, opacity 120ms ease',
      ...style,
    }}
    onMouseDown={e => !disabled && (e.currentTarget.style.transform = 'scale(0.985)')}
    onMouseUp={e => !disabled && (e.currentTarget.style.transform = '')}
    onMouseLeave={e => !disabled && (e.currentTarget.style.transform = '')}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, style = {} }) {
  return (
    <button onClick={onClick} style={{
      ...baseText,
      height: 44, borderRadius: 12, padding: '0 16px',
      background: 'transparent',
      color: TOKENS.ink,
      border: `0.5px solid ${TOKENS.lineStrong}`,
      fontSize: 15, fontWeight: 500,
      cursor: 'pointer', letterSpacing: '-0.01em',
      ...style,
    }}>{children}</button>
  );
}

function TextInput({ value, onChange, placeholder, suffix, autoFocus, type = 'text', style = {}, inputMode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: TOKENS.surface, borderRadius: 14,
      padding: '0 16px', height: 54,
      border: `0.5px solid ${TOKENS.line}`,
      ...style,
    }}>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        inputMode={inputMode}
        autoFocus={autoFocus}
        style={{
          ...baseText,
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontSize: 17, fontWeight: 400, color: TOKENS.ink,
        }}
      />
      {suffix && <span style={{ ...baseText, color: TOKENS.inkMuted, fontSize: 15 }}>{suffix}</span>}
    </div>
  );
}

function Card({ children, style = {}, onClick, padding = 20 }) {
  return (
    <div onClick={onClick} style={{
      background: TOKENS.surface, borderRadius: 20,
      padding, border: `0.5px solid ${TOKENS.line}`,
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}>{children}</div>
  );
}

function Divider({ inset = 0 }) {
  return <div style={{ height: 0.5, background: TOKENS.line, marginLeft: inset }} />;
}

function Pill({ children, accent = false, style = {} }) {
  return (
    <span style={{
      ...baseText,
      display: 'inline-flex', alignItems: 'center',
      height: 22, padding: '0 8px',
      borderRadius: 6,
      background: accent ? TOKENS.amberTint : TOKENS.surfaceAlt,
      color: accent ? TOKENS.amberDeep : TOKENS.inkSoft,
      fontSize: 11.5, fontWeight: 500,
      letterSpacing: '-0.005em',
      ...style,
    }}>{children}</span>
  );
}

// Section label (subdued uppercase)
function SectionLabel({ children, style = {} }) {
  return (
    <div style={{
      ...baseText,
      fontSize: 11, fontWeight: 500,
      color: TOKENS.inkMuted,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      ...style,
    }}>{children}</div>
  );
}

// Checkbox — plan item
function PlanCheck({ checked, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 24, height: 24, borderRadius: 12,
      border: checked ? 'none' : `1.3px solid ${TOKENS.lineStrong}`,
      background: checked ? '#14100e' : 'transparent',
      cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 0, flexShrink: 0,
      transition: 'all 140ms ease',
    }}>
      {checked && (
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path d="M2.5 6l2.5 2.5L9.5 3.5" fill="none" stroke={TOKENS.bg}
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
}

// Day swiper — < date > control used on screens that scroll through days
function DaySwiper({ date, onChange }) {
  const today = window.localISO();
  const isToday = date === today;
  const isFuture = new Date(date) > new Date(today);
  const shift = (days) => {
    const d = new Date(date); d.setDate(d.getDate() + days);
    onChange(window.localISO(d));
  };
  const wds = ['Søndag','Mandag','Tirsdag','Onsdag','Torsdag','Fredag','Lørdag'];
  const weekday = wds[new Date(date).getDay()];
  const arrowBtn = {
    width: 36, height: 36, borderRadius: 18,
    background: 'transparent', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
  return (
    <div style={{
      padding: '8px 20px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
    }}>
      <button onClick={() => shift(-1)} style={arrowBtn}>
        <svg width="14" height="14" viewBox="0 0 14 14"><path d="M9 2L4 7l5 5" fill="none" stroke={TOKENS.ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <div style={{ textAlign: 'center', minWidth: 160 }}>
        <div style={{
          ...baseText, fontSize: 18, fontWeight: 500, color: TOKENS.ink,
          letterSpacing: '-0.02em',
        }}>{isToday ? 'I dag' : window.formatDanishDate(date)}</div>
        {!isToday && (
          <div style={{
            ...baseText, fontSize: 11, color: TOKENS.inkMuted,
            marginTop: 2, letterSpacing: '0.04em',
          }}>{weekday}</div>
        )}
      </div>
      <button onClick={() => !isFuture && shift(1)} disabled={isFuture} style={{ ...arrowBtn, opacity: isFuture ? 0.3 : 1 }}>
        <svg width="14" height="14" viewBox="0 0 14 14"><path d="M5 2l5 5-5 5" fill="none" stroke={TOKENS.ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  );
}

Object.assign(window, {
  VegaAvatar, PrimaryButton, GhostButton, TextInput,
  Card, Divider, Pill, SectionLabel, PlanCheck, DaySwiper, baseText,
});
