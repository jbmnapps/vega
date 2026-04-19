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
          <WeightChart weights={weights} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, padding: '0 4px' }}>
            <div style={{ ...baseText, fontSize: 10.5, color: TOKENS.inkMuted, letterSpacing: '0.02em' }}>{formatDanishDate(weights[0].date, true)}</div>
            <div style={{ ...baseText, fontSize: 10.5, color: TOKENS.inkMuted, letterSpacing: '0.02em' }}>{formatDanishDate(latest.date, true)}</div>
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

function WeightChart({ weights, height = 140, showDots = false }) {
  const W = 340;
  const H = height;
  const pad = { l: 8, r: 8, t: 18, b: 8 };
  const kgs = weights.map(w => w.kg);
  const minKg = Math.min(...kgs) - 0.05;
  const maxKg = Math.max(...kgs) + 0.05;
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
  const [kg, setKg] = React.useState('');
  const valid = parseFloat((kg || '').replace(',', '.')) > 0 && parseFloat((kg || '').replace(',', '.')) < 30;
  const submit = () => {
    if (!valid) return;
    app.addWeight(parseFloat(kg.replace(',', '.')));
    onComplete();
  };
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Log vægt" onBack={onBack} />
      <div style={{ flex: 1, padding: '0 20px 120px', overflow: 'auto' }}>
        <div style={{ padding: '32px 6px 10px' }}>
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
    </div>
  );
}

// Detailed graph — bigger, more room, individual dots, hover to inspect
function VaegtDetailScreen({ app, onBack }) {
  const weights = app.weights;
  const [selIdx, setSelIdx] = React.useState(weights.length - 1);
  const sel = weights[selIdx];
  const prev = weights[selIdx - 1];
  const delta = prev ? sel.kg - prev.kg : 0;

  const W = 360, H = 240;
  const pad = { l: 16, r: 16, t: 30, b: 30 };
  const kgs = weights.map(w => w.kg);
  const minKg = Math.min(...kgs) - 0.08;
  const maxKg = Math.max(...kgs) + 0.08;
  const range = maxKg - minKg || 1;
  const xs = weights.map((_, i) => pad.l + (i / (weights.length - 1 || 1)) * (W - pad.l - pad.r));
  const ys = weights.map(w => pad.t + (1 - (w.kg - minKg) / range) * (H - pad.t - pad.b));

  let path = `M ${xs[0]},${ys[0]}`;
  for (let i = 1; i < xs.length; i++) {
    const x0 = xs[i - 1], y0 = ys[i - 1];
    const x1 = xs[i], y1 = ys[i];
    const mx = (x0 + x1) / 2;
    path += ` C ${mx},${y0} ${mx},${y1} ${x1},${y1}`;
  }
  const areaPath = path + ` L ${xs[xs.length-1]},${H - pad.b} L ${xs[0]},${H - pad.b} Z`;

  // Y ticks — 3 levels
  const ticks = [minKg, (minKg + maxKg) / 2, maxKg];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Graf" onBack={onBack} />
      <div style={{ flex: 1, padding: '0 0 120px', overflow: 'auto' }}>

        {/* Selected point header */}
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
          {prev && (
            <div style={{ ...baseText, fontSize: 12, color: TOKENS.inkMuted, marginTop: 6, letterSpacing: '-0.005em', fontVariantNumeric: 'tabular-nums' }}>
              {delta === 0 ? '±0' : (delta > 0 ? '+' : '−') + Math.abs(delta).toFixed(2).replace('.', ',')} kg siden forrige
            </div>
          )}
        </div>

        {/* Chart */}
        <div style={{ padding: '0 16px' }}>
          <Card padding={12}>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
              <defs>
                <linearGradient id="wgrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={TOKENS.amber} stopOpacity="0.15" />
                  <stop offset="100%" stopColor={TOKENS.amber} stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Y grid lines */}
              {ticks.map((t, i) => {
                const y = pad.t + (1 - (t - minKg) / range) * (H - pad.t - pad.b);
                return (
                  <g key={i}>
                    <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke={TOKENS.line} strokeWidth="0.5" strokeDasharray="2 3" />
                    <text x={W - pad.r} y={y - 4} textAnchor="end" fontSize="9" fill={TOKENS.inkMuted} fontFamily="Inter" style={{ letterSpacing: '0.04em' }}>
                      {t.toFixed(2).replace('.', ',')}
                    </text>
                  </g>
                );
              })}
              <path d={areaPath} fill="url(#wgrad2)" />
              <path d={path} fill="none" stroke={TOKENS.amber} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              {/* All dots */}
              {weights.map((w, i) => (
                <g key={i}>
                  <circle cx={xs[i]} cy={ys[i]} r={i === selIdx ? 6 : 3.2}
                    fill={i === selIdx ? TOKENS.amber : TOKENS.surface}
                    stroke={TOKENS.amber} strokeWidth={i === selIdx ? 2 : 1.4}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelIdx(i)}
                  />
                  {/* Invisible hit target */}
                  <circle cx={xs[i]} cy={ys[i]} r="14" fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelIdx(i)} />
                </g>
              ))}
              {/* Selected vertical guide */}
              <line x1={xs[selIdx]} y1={pad.t} x2={xs[selIdx]} y2={H - pad.b}
                stroke={TOKENS.amber} strokeWidth="0.8" strokeDasharray="2 3" opacity="0.5" />
              {/* X labels — first & last */}
              <text x={xs[0]} y={H - 8} fontSize="9" fill={TOKENS.inkMuted} fontFamily="Inter">{formatDanishDate(weights[0].date, true)}</text>
              <text x={xs[xs.length-1]} y={H - 8} textAnchor="end" fontSize="9" fill={TOKENS.inkMuted} fontFamily="Inter">{formatDanishDate(weights[weights.length-1].date, true)}</text>
            </svg>
          </Card>
        </div>

        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ ...baseText, fontSize: 12, color: TOKENS.inkMuted, textAlign: 'center', letterSpacing: '0.04em', lineHeight: 1.5 }}>
            Tryk på en måling for detaljer
          </div>
        </div>
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
