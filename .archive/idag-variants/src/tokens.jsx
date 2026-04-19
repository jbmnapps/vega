// Design tokens — derived from Vega's palette (ginger amber, cream, warm ink, soft blush)
const TOKENS = {
  // Surfaces
  bg: '#f4efe7',         // app background — warm cream
  surface: '#faf6f0',    // cards
  surfaceAlt: '#efe9df', // subtle inset / blush fallback
  line: 'rgba(42, 37, 34, 0.08)',
  lineStrong: 'rgba(42, 37, 34, 0.14)',

  // Ink
  ink: '#2a2522',          // warm near-black
  inkSoft: '#5c5248',      // muted body
  inkMuted: '#8a817a',     // secondary
  inkFaint: '#b8aea3', // placeholder / hairlines

  // Accent (Vega's ginger)
  amber: '#c98a4b',
  amberSoft: '#e6c9a7',
  amberTint: '#f2e4d1',

  // Rose (paw pad whisper) — sparingly
  rose: '#d4a794',

  // Sage (observation / neutral-cool)
  sage: '#9ba694',

  // Radii
  r1: 10,
  r2: 14,
  r3: 20,
  r4: 28,
};

window.TOKENS = TOKENS;
