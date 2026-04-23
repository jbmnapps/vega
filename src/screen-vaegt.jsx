// Vægt — weight. Calm overview + detailed graph mode + målinger list.

function VaegtScreen({ app, onOpenLogger, onOpenDetail, onOpenMalinger }) {
  const weights = app.weights;
  const latest = weights[weights.length - 1];

  const latestDate = new Date(latest.date);
  const weekAgoTarget = new Date(latestDate); weekAgoTarget.setDate(weekAgoTarget.getDate() - 7);
  const monthAgoTarget = new Date(latestDate); monthAgoTarget.setMonth(monthAgoTarget.getMonth() - 1);

  const closestTo = (target) => {
    let best = weights[0]; let bestDiff = Infinity;
    for (const w of weights) {
      const d = Math.abs(new Date(w.date) - target);
      if (d < bestDiff) { bestDiff = d; best = w; }
    }
    return best;
  };
  const weekRef = closestTo(weekAgoTarget);
  const monthRef = closestTo(monthAgoTarget);
  const weekDelta = latest.kg - weekRef.kg;
  const monthDelta = latest.kg - monthRef.kg;
  const significant = Math.abs(monthDelta) >= 0.15;

  // Rolling 30-day window for the overview chart (Decision #39)
  const today = new Date();
  const windowStart = new Date(today); windowStart.setDate(today.getDate() - 30);
  const windowStartIso = window.localISO(windowStart);
  const todayIso = window.localISO(today);
  const visibleWeights = weights.filter(w => w.date >= windowStartIso && w.date <= todayIso);

  return (
    <div style={{ padding: '0 0 120px' }}>
      <ScreenHeader title="Vægt" />

      <div style={{ padding: '12px 24px 32px', textAlign: 'center' }}>
        <div style={{ ...baseText, fontSize: 11, color: TOKENS.inkMuted, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Seneste</div>
        <div style={{
          ...baseText, fontSize: 72, fontWeight: 300, color: TOKENS.ink,
          letterSpacing: '-0.045em', marginTop: 6, lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {latest.kg.toFixed(2).replace('.', ',')}
          <span style={{ fontSize: 26, color: TOKENS.inkMuted, marginLeft: 10, letterSpacing: '-0.02em' }}>kg</span>
        </div>
        <div style={{ ...baseText, fontSize: 13, color: TOKENS.inkMuted, marginTop: 10, letterSpacing: '-0.005em' }}>{formatDanishDate(latest.date)}</div>
      </div>

      <div style={{ padding: '0 20px 24px' }}>
        <Card padding={20} onClick={onOpenDetail} style={{ cursor: 'pointer' }}>
          {visibleWeights.length > 0 ? (
            <WeightChart weights={visibleWeights} />
          ) : (
            <div style={{
              height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center',
              ...baseText, fontSize: 13, color: TOKENS.inkMuted, letterSpacing: '-0.005em',
            }}>
              Ingen målinger i seneste 30 dage
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, padding: '0 4px' }}>
            <div style={{ ...baseText, fontSize: 10.5, color: TOKENS.inkMuted, letterSpacing: '0.02em' }}>{formatDanishDate(windowStartIso, true)}</div>
            <div style={{ ...baseText, fontSize: 10.5, color: TOKENS.inkMuted, letterSpacing: '0.02em' }}>I dag</div>
          </div>
          <div style={{ ...baseText, fontSize: 11, color: TOKENS.inkFaint, textAlign: 'center', marginTop: 10, letterSpacing: '0.04em' }}>Tryk for detaljer</div>
        </Card>
      </div>

      <div style={{ padding: '0 20px 24px' }}>
        <Card padding={0}>
          <DeltaRow label="Siden sidste uge" delta={weekDelta} significant={false} />
          <Divider inset={18} />
          <DeltaRow label="Siden sidste måned" delta={monthDelta} significant={significant} />
        </Card>
        {significant && (
          <div style={{ ...baseText, fontSize: 12, color: TOKENS.inkMuted, marginTop: 10, padding: '0 8px', letterSpacing: '-0.005em', lineHeight: 1.5 }}>
            Markant ændring over en måned.
          </div>
        )}
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <GhostButton onClick={() => onOpenLogger('vaegt-log')} style={{ width: '100%', height: 52 }}>
          Log vægt
        </GhostButton>
        <button onClick={onOpenMalinger} style={{
          ...baseText, height: 44, background: 'transparent', border: 'none',
          color: TOKENS.inkSoft, fontSize: 14, cursor: 'pointer', letterSpacing: '-0.01em',
        }}>Målinger ({weights.length})</button>
      </div>
    </div>
  );
}

function DeltaRow({ label, delta, significant }) {
  const arrow = delta > 0.005 ? '↑' : delta < -0.005 ? '↓' : '';
  const display = Math.abs(delta) < 0.005 ? '±0 kg' : `${arrow} ${Math.abs(delta).toFixed(2).replace('.', ',')} kg`;
  return (
    <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ ...baseText, fontSize: 15, color: TOKENS.ink, letterSpacing: '-0.01em' }}>{label}</div>
      <div style={{
        ...baseText, fontSize: 15, fontWeight: 450,
        color: significant ? TOKENS.amberDeep : TOKENS.ink,
        fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
      }}>{display}</div>
    </div>
  );
}

// Y-axis rule (Decision #38): nearest 0.5 above highest / below lowest,
// strictly — line must never touch top or bottom edge.
function ceilHalfStrict(x) { const c = Math.ceil(x * 2) / 2; return c > x ? c : c + 0.5; }
function floorHalfStrict(x) { const f = Math.floor(x * 2) / 2; return f < x ? f : f - 0.5; }

function WeightChart({ weights, height = 140, showDots = false }) {
  const W = 340;
  const H = height;
  const pad = { l: 8, r: 8, t: 18, b: 8 };
  const kgs = weights.map(w => w.kg);
  const minKg = floorHalfStrict(Math.min(...kgs));
  const maxKg = ceilHalfStrict(Math.max(...kgs));
  const range = maxKg - minKg || 1;
  const xs = weights.map((_, i) => pad.l + (i / (weights.length - 1 || 1)) * (W - pad.l - pad.r));
  const ys = weights.map(w => pad.t + (1 - (w.kg - minKg) / range) * (H - pad.t - pad.b));

  const path = (() => {
    let d = `M ${xs[0]},${ys[0]}`;
    for (let i = 1; i < xs.length; i++) {
      const x0 = xs[i - 1], y0 = ys[i - 1];
      const x1 = xs[i], y1 = ys[i];
      const mx = (x0 + x1) / 2;
      d += ` C ${mx},${y0} ${mx},${y1} ${x1},${y1}`;
    }
    return d;
  })();
  const areaPath = path + ` L ${xs[xs.length-1]},${H - pad.b} L ${xs[0]},${H - pad.b} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="wgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={TOKENS.amber} stopOpacity="0.18" />
          <stop offset="100%" stopColor={TOKENS.amber} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#wgrad)" />
      <path d={path} fill="none" stroke={TOKENS.amber} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      {showDots && weights.map((w, i) => (
        <circle key={i} cx={xs[i]} cy={ys[i]} r="3" fill={TOKENS.surface} stroke={TOKENS.amber} strokeWidth="1.4" />
      ))}
      {!showDots && <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="4" fill={TOKENS.surface} stroke={TOKENS.amber} strokeWidth="1.6" />}
    </svg>
  );
}

function formatDanishDate(iso, short = false) {
  const d = new Date(iso);
  const months = ['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec'];
  const monthsLong = ['januar','februar','marts','april','maj','juni','juli','august','september','oktober','november','december'];
  if (short) return `${d.getDate()}. ${months[d.getMonth()]}`;
  return `${d.getDate()}. ${monthsLong[d.getMonth()]}`;
}

function VaegtLogScreen({ app, onBack, onComplete }) {
  const today = window.localISO();
  const [kg, setKg] = React.useState('');
  const [date, setDate] = React.useState(today);
  const [showDateSheet, setShowDateSheet] = React.useState(false);
  const valid = parseFloat((kg || '').replace(',', '.')) > 0 && parseFloat((kg || '').replace(',', '.')) < 30;
  const submit = () => {
    if (!valid) return;
    app.addWeight(parseFloat(kg.replace(',', '.')), date);
    onComplete();
  };
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Log vægt" onBack={onBack} />
      <div style={{ flex: 1, padding: '0 20px 120px', overflow: 'auto' }}>
        <div style={{ marginBottom: 20 }}>
          <DateRow date={date} onOpen={() => setShowDateSheet(true)} />
        </div>
        <div style={{ padding: '0 6px 10px' }}>
          <SectionLabel>Vægt</SectionLabel>
        </div>
        <TextInput value={kg} onChange={setKg} placeholder="0,00" suffix="kg" inputMode="decimal" autoFocus />
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <div style={{ ...baseText, fontSize: 11, color: TOKENS.inkMuted, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Seneste</div>
          <div style={{
            ...baseText, fontSize: 22, fontWeight: 450, color: TOKENS.ink, marginTop: 8,
            letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
          }}>{app.weights[app.weights.length-1].kg.toFixed(2).replace('.', ',')} kg</div>
          <div style={{ ...baseText, fontSize: 12, color: TOKENS.inkMuted, marginTop: 4, letterSpacing: '-0.005em' }}>{formatDanishDate(app.weights[app.weights.length-1].date)}</div>
        </div>
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '16px 20px 34px',
        background: `linear-gradient(180deg, rgba(244,239,231,0) 0%, ${TOKENS.bg} 40%)`,
      }}>
        <PrimaryButton onClick={submit} disabled={!valid}>Gem</PrimaryButton>
      </div>
      {showDateSheet && (
        <DateSheet
          value={date}
          onSelect={(iso) => { setDate(iso); setShowDateSheet(false); }}
          onClose={() => setShowDateSheet(false)}
        />
      )}
    </div>
  );
}

// Zoom-presets for Vægt-detail (Decision #40, #66)
const DETAIL_PRESETS = [
  { id: '7d', label: '7 dage', days: 7 },
  { id: '1m', label: '1 måned', days: 30 },
  { id: '6m', label: '6 mdr', days: 180 },
  { id: '1y', label: '1 år', days: 365 },
];

function ZoomPresets({ value, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 4, padding: 4,
      background: TOKENS.surfaceAlt,
      borderRadius: 12,
    }}>
      {DETAIL_PRESETS.map(p => {
        const active = p.id === value;
        return (
          <button key={p.id} onClick={() => onChange(p.id)} style={{
            ...baseText, flex: 1, height: 34, border: 'none', cursor: 'pointer',
            borderRadius: 9,
            background: active ? TOKENS.surface : 'transparent',
            color: active ? TOKENS.ink : TOKENS.inkMuted,
            fontSize: 13, fontWeight: active ? 500 : 400, letterSpacing: '-0.01em',
            boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            transition: 'background 120ms ease, color 120ms ease',
          }}>{p.label}</button>
        );
      })}
    </div>
  );
}

// Monotone cubic (Fritsch-Carlson) interpolation of allWeights → N evenly-spaced samples.
// Constant point count means the rAF loop can morph between any two preset curves.
// Monotone cubic preserves local monotonicity — no overshoot/ripple between measurements,
// but smooth tangents where the data actually curves (Decision #78).
function sampleCurve(allWeights, startMs, endMs, n) {
  const pts = allWeights.map(w => ({ ms: new Date(w.date + 'T00:00:00').getTime(), kg: w.kg }));
  const N = pts.length;
  if (N === 0) return [];
  if (N === 1) return Array.from({ length: n }, (_, i) => ({ ms: startMs + (i / (n - 1)) * (endMs - startMs), kg: pts[0].kg }));

  const d = new Array(N - 1);
  for (let i = 0; i < N - 1; i++) d[i] = (pts[i + 1].kg - pts[i].kg) / (pts[i + 1].ms - pts[i].ms);
  const m = new Array(N);
  m[0] = d[0];
  m[N - 1] = d[N - 2];
  for (let i = 1; i < N - 1; i++) m[i] = (d[i - 1] * d[i] <= 0) ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < N - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i];
    const h = a * a + b * b;
    if (h > 9) { const t = 3 / Math.sqrt(h); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
  }

  return Array.from({ length: n }, (_, i) => {
    const ms = startMs + (i / (n - 1)) * (endMs - startMs);
    if (ms <= pts[0].ms) return { ms, kg: pts[0].kg };
    if (ms >= pts[N - 1].ms) return { ms, kg: pts[N - 1].kg };
    let lo = 0;
    while (lo < N - 2 && pts[lo + 1].ms <= ms) lo++;
    const h = pts[lo + 1].ms - pts[lo].ms;
    const t = (ms - pts[lo].ms) / h;
    const t2 = t * t, t3 = t2 * t;
    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;
    const kg = h00 * pts[lo].kg + h10 * h * m[lo] + h01 * pts[lo + 1].kg + h11 * h * m[lo + 1];
    return { ms, kg };
  });
}

// Detailed graph — bigger, more room, individual dots, hover to inspect
function VaegtDetailScreen({ app, onBack }) {
  const allWeights = app.weights;
  const [presetId, setPresetId] = React.useState('1m');
  const preset = DETAIL_PRESETS.find(p => p.id === presetId);

  const today = new Date();
  const windowStart = new Date(today); windowStart.setDate(today.getDate() - preset.days);
  const windowStartIso = window.localISO(windowStart);
  const todayIso = window.localISO(today);
  const weights = allWeights.filter(w => w.date >= windowStartIso && w.date <= todayIso);

  const [selIdx, setSelIdx] = React.useState(weights.length - 1);
  React.useEffect(() => { setSelIdx(weights.length - 1); }, [presetId]);
  const safeSelIdx = Math.min(selIdx, weights.length - 1);
  const sel = weights[safeSelIdx];
  const isEmpty = weights.length === 0;

  const svgRef = React.useRef(null);
  const scrubbingRef = React.useRef(false);

  const W = 360, H = 240;
  const pad = { l: 16, r: 16, t: 30, b: 30 };
  const kgs = weights.map(w => w.kg);
  const minKg = isEmpty ? 4.0 : floorHalfStrict(Math.min(...kgs));
  const maxKg = isEmpty ? 4.5 : ceilHalfStrict(Math.max(...kgs));

  const windowStartMs = new Date(windowStartIso + 'T00:00:00').getTime();
  const windowEndMs = new Date(todayIso + 'T00:00:00').getTime();
  const earlierCount = allWeights.filter(w => w.date < windowStartIso).length;
  const firstVisible = weights[0];
  const effectiveStartMs = (!isEmpty && earlierCount === 0)
    ? new Date(firstVisible.date + 'T00:00:00').getTime()
    : windowStartMs;
  const effectiveStartIso = (!isEmpty && earlierCount === 0) ? firstVisible.date : windowStartIso;

  const SAMPLE_N = 48;
  const ANIM_MS = 420;
  const easeInOut = t => t < 0.5 ? 2*t*t : -1+(4-2*t)*t;

  // Animated "camera": sampled curve + y-range + x-range all morph together
  // so 6m ↔ 1y feels like a smooth zoom, not two different charts snapping (Decision #79).
  const targetSampled = isEmpty ? [] : sampleCurve(allWeights, effectiveStartMs, windowEndMs, SAMPLE_N);
  const targetFrame = { sampled: targetSampled, minKg, maxKg, startMs: effectiveStartMs, endMs: windowEndMs };
  const [displayed, setDisplayed] = React.useState(targetFrame);
  const prevFrameRef = React.useRef(targetFrame);
  const animRef = React.useRef(null);

  React.useEffect(() => {
    const from = prevFrameRef.current;
    const to = targetFrame;
    if (!from.sampled.length || !to.sampled.length) { setDisplayed(to); prevFrameRef.current = to; return; }
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const t0 = performance.now();
    const tick = (now) => {
      const e = easeInOut(Math.min(1, (now - t0) / ANIM_MS));
      const lerp = (a, b) => a + (b - a) * e;
      const sampled = from.sampled.map((fp, i) => ({ ms: lerp(fp.ms, to.sampled[i].ms), kg: lerp(fp.kg, to.sampled[i].kg) }));
      setDisplayed({
        sampled,
        minKg: lerp(from.minKg, to.minKg),
        maxKg: lerp(from.maxKg, to.maxKg),
        startMs: lerp(from.startMs, to.startMs),
        endMs: lerp(from.endMs, to.endMs),
      });
      if (e < 1) animRef.current = requestAnimationFrame(tick);
      else prevFrameRef.current = to;
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [presetId]);

  // Coordinate mapping uses the animated frame (not the target frame)
  const dRange = (displayed.maxKg - displayed.minKg) || 1;
  const dSpanMs = Math.max(displayed.endMs - displayed.startMs, 86400000);
  const xForMs = (ms) => pad.l + ((ms - displayed.startMs) / dSpanMs) * (W - pad.l - pad.r);
  const yForKg = (kg) => pad.t + (1 - (kg - displayed.minKg) / dRange) * (H - pad.t - pad.b);

  // Path from animated sample
  const sxs = displayed.sampled.map(p => xForMs(p.ms));
  const sys = displayed.sampled.map(p => yForKg(p.kg));

  const path = !displayed.sampled.length ? '' : (() => {
    // Straight segments between 48 monotone cubic samples — the samples are
    // already C1-smooth, so midpoint-bezier on top just adds ripples.
    let d = `M ${sxs[0].toFixed(2)},${sys[0].toFixed(2)}`;
    for (let i = 1; i < SAMPLE_N; i++) d += ` L ${sxs[i].toFixed(2)},${sys[i].toFixed(2)}`;
    return d;
  })();
  const areaPath = !displayed.sampled.length ? '' : path + ` L ${sxs[SAMPLE_N-1].toFixed(2)},${H-pad.b} L ${sxs[0].toFixed(2)},${H-pad.b} Z`;

  // Dots: derive y by linearly interpolating the displayed sample array at the dot's ms.
  // This guarantees dots sit exactly on the rendered curve at every animation frame —
  // not just at t=1 when sampled.kg finally equals real kg.
  const dotPos = (ms) => {
    const f = Math.max(0, Math.min(SAMPLE_N - 1, ((ms - displayed.startMs) / dSpanMs) * (SAMPLE_N - 1)));
    const i0 = Math.floor(f), i1 = Math.min(SAMPLE_N - 1, i0 + 1);
    const t = f - i0;
    return { x: sxs[i0] + (sxs[i1] - sxs[i0]) * t, y: sys[i0] + (sys[i1] - sys[i0]) * t };
  };
  const dotPositions = weights.map(w => dotPos(new Date(w.date + 'T00:00:00').getTime()));
  const xs = dotPositions.map(p => p.x);
  const ys = dotPositions.map(p => p.y);

  // Y ticks: values chosen from target range (stable labels), positions use displayed range (animated)
  const ticks = [];
  for (let t = minKg; t <= maxKg + 0.001; t += 0.5) ticks.push(Number(t.toFixed(1)));

  // Convert a pointer clientX to nearest weight index (Decision #81)
  const xToIdx = (clientX) => {
    if (!svgRef.current || !xs.length) return safeSelIdx;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * W;
    return xs.reduce((best, x, i) => Math.abs(x - svgX) < Math.abs(xs[best] - svgX) ? i : best, 0);
  };
  const onPointerDown = (e) => {
    scrubbingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setSelIdx(xToIdx(e.clientX));
  };
  const onPointerMove = (e) => {
    if (!scrubbingRef.current) return;
    setSelIdx(xToIdx(e.clientX));
  };
  const onPointerUp = () => { scrubbingRef.current = false; };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Graf" onBack={onBack} />
      <div style={{ flex: 1, padding: '0 0 120px', overflow: 'auto' }}>

        {/* Selected point header — skjules hvis vinduet er tomt */}
        {!isEmpty && (
          <div style={{ padding: '8px 24px 20px', textAlign: 'center' }}>
            <div style={{ ...baseText, fontSize: 11, color: TOKENS.inkMuted, textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              {formatDanishDate(sel.date)}
            </div>
            <div style={{
              ...baseText, fontSize: 52, fontWeight: 300, color: TOKENS.ink,
              letterSpacing: '-0.045em', marginTop: 6, fontVariantNumeric: 'tabular-nums',
            }}>
              {sel.kg.toFixed(2).replace('.', ',')}
              <span style={{ fontSize: 20, color: TOKENS.inkMuted, marginLeft: 8, letterSpacing: '-0.02em' }}>kg</span>
            </div>
          </div>
        )}
        {isEmpty && <div style={{ padding: '20px 24px 20px' }} />}

        {/* Zoom-presets */}
        <div style={{ padding: '0 16px 16px' }}>
          <ZoomPresets value={presetId} onChange={setPresetId} />
        </div>

        {/* Chart */}
        <div style={{ padding: '0 16px' }}>
          <Card padding={12}>
            {isEmpty ? (
              <div style={{
                height: H - 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                ...baseText, fontSize: 13, color: TOKENS.inkMuted, letterSpacing: '-0.005em',
              }}>
                Ingen målinger i dette vindue
              </div>
            ) : (
              <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%"
                style={{ display: 'block', touchAction: 'none', cursor: 'crosshair' }}
                onPointerDown={onPointerDown} onPointerMove={onPointerMove}
                onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
                <defs>
                  <linearGradient id="wgrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={TOKENS.amber} stopOpacity="0.15" />
                    <stop offset="100%" stopColor={TOKENS.amber} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <g>
{ticks.map((t, i) => {
                  const y = yForKg(t);
                  return (
                    <g key={i}>
                      <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke={TOKENS.line} strokeWidth="0.5" strokeDasharray="2 3" />
                      <text x={W - pad.r} y={y - 4} textAnchor="end" fontSize="9" fill={TOKENS.inkMuted} fontFamily="Inter" style={{ letterSpacing: '0.04em' }}>
                        {t.toFixed(1).replace('.', ',')}
                      </text>
                    </g>
                  );
                })}
                <path d={areaPath} fill="url(#wgrad2)" />
                <path d={path} fill="none" stroke={TOKENS.amber} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                {weights.map((w, i) => {
                  const isSel = i === safeSelIdx;
                  return (
                    <g key={w.date}>
                      {!isSel && (
                        <line x1={xs[i]} y1={H - pad.b + 3} x2={xs[i]} y2={H - pad.b + 8}
                          stroke={TOKENS.amber} strokeWidth="1" opacity="0.45" />
                      )}
                      {isSel && (
                        <circle cx={xs[i]} cy={ys[i]} r="6"
                          fill={TOKENS.amber} stroke={TOKENS.amber} strokeWidth="2"
                        />
                      )}
                      <circle cx={xs[i]} cy={ys[i]} r="14" fill="transparent"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelIdx(i)} />
                    </g>
                  );
                })}
                <line x1={xs[safeSelIdx]} y1={pad.t} x2={xs[safeSelIdx]} y2={H - pad.b}
                  stroke={TOKENS.amber} strokeWidth="0.8" strokeDasharray="2 3" opacity="0.5" />
                {/* X labels — altid vindues-grænser */}
                <text x={pad.l} y={H - 8} fontSize="9" fill={TOKENS.inkMuted} fontFamily="Inter">{formatDanishDate(effectiveStartIso, true)}</text>
                <text x={W - pad.r} y={H - 8} textAnchor="end" fontSize="9" fill={TOKENS.inkMuted} fontFamily="Inter">I dag</text>
                </g>
              </svg>
            )}
          </Card>
        </div>

        {!isEmpty && (
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{ ...baseText, fontSize: 12, color: TOKENS.inkMuted, textAlign: 'center', letterSpacing: '0.04em', lineHeight: 1.5 }}>
              Tryk på en måling for detaljer
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Målinger — list of every recorded weight
function MalingerScreen({ app, onBack }) {
  const weights = [...app.weights].reverse();
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Målinger" onBack={onBack} />
      <div style={{ flex: 1, padding: '0 20px 120px', overflow: 'auto' }}>
        <Card padding={0}>
          {weights.map((w, i) => {
            const next = weights[i + 1];
            const delta = next ? w.kg - next.kg : 0;
            return (
              <div key={w.date + i}>
                <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ ...baseText, fontSize: 14, color: TOKENS.ink, letterSpacing: '-0.01em' }}>
                      {formatDanishDate(w.date)}
                    </div>
                    {next && Math.abs(delta) >= 0.005 && (
                      <div style={{ ...baseText, fontSize: 11, color: TOKENS.inkMuted, marginTop: 3, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.005em' }}>
                        {delta > 0 ? '+' : '−'}{Math.abs(delta).toFixed(2).replace('.', ',')} kg
                      </div>
                    )}
                  </div>
                  <div style={{
                    ...baseText, fontSize: 15, fontWeight: 450, color: TOKENS.ink,
                    fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
                  }}>{w.kg.toFixed(2).replace('.', ',')} kg</div>
                </div>
                {i < weights.length - 1 && <Divider inset={18} />}
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

window.VaegtScreen = VaegtScreen;
window.VaegtLogScreen = VaegtLogScreen;
window.VaegtDetailScreen = VaegtDetailScreen;
window.MalingerScreen = MalingerScreen;
window.formatDanishDate = formatDanishDate;
