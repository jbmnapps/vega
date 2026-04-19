// Ny plan-post — sheet åbnet fra Idag's "Tilføj"-række.
// Påkrævet: tekst + tid. Valgfrit: kategori + kategori-detaljer.
// Hvis tid er i fortiden: "klaret?"-toggle (default ja).

function AddPostScreen({ app, onBack, onComplete }) {
  const [text, setText] = React.useState('');
  const [digits, setDigits] = React.useState('');
  const [done, setDone] = React.useState(true);
  const [category, setCategory] = React.useState(null);
  const [productId, setProductId] = React.useState(null);
  const [grams, setGrams] = React.useState('');
  const [minutes, setMinutes] = React.useState('');
  const [medDose, setMedDose] = React.useState('');
  const [medUnit, setMedUnit] = React.useState('mg');
  const [showNewProduct, setShowNewProduct] = React.useState(false);

  const validTime = digits.length === 4;
  const valid = text.trim().length > 0 && validTime;
  const past = validTime && isTimeInPast(digits);

  const submit = () => {
    if (!valid) return;
    const details = {};
    if (category === 'mad') {
      if (productId) details.productId = productId;
      if (grams) details.grams = parseFloat(grams.replace(',', '.'));
    }
    if (category === 'aktivitet' && minutes) {
      details.minutes = parseFloat(minutes.replace(',', '.'));
    }
    if (category === 'medicin' && medDose) {
      details.dose = parseFloat(medDose.replace(',', '.'));
      details.unit = medUnit;
    }
    app.addPlanPost({
      label: text.trim(),
      time: digitsToTime(digits),
      category,
      details: Object.keys(details).length ? details : null,
      done: past ? done : false,
    });
    onComplete();
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Ny plan" onBack={onBack} />
      <div style={{ flex: 1, padding: '0 20px 140px', overflow: 'auto' }}>
        <div style={{ padding: '0 6px 10px' }}><SectionLabel>Hvad</SectionLabel></div>
        <TextInput value={text} onChange={setText} placeholder="F.eks. Aftenmad" autoFocus />

        <div style={{ padding: '22px 6px 10px' }}><SectionLabel>Tidspunkt</SectionLabel></div>
        <MaskedTimeInput digits={digits} onChange={setDigits} />

        {past && (
          <div style={{ marginTop: 14 }}>
            <ToggleRow label="Klaret?" value={done} onChange={setDone} />
          </div>
        )}

        <div style={{ padding: '22px 6px 10px' }}>
          <SectionLabel>Kategori <span style={{ color: TOKENS.inkFaint, textTransform: 'none', letterSpacing: '-0.005em', fontWeight: 400, marginLeft: 4 }}>valgfrit</span></SectionLabel>
        </div>
        <CategoryPicker value={category} onChange={setCategory} />

        {category === 'mad' && (
          <div style={{ marginTop: 14 }}>
            <ProductPicker
              products={app.products}
              value={productId}
              onChange={setProductId}
              onCreateNew={() => setShowNewProduct(true)}
            />
            <div style={{ marginTop: 10 }}>
              <TextInput value={grams} onChange={setGrams} placeholder="Mængde" suffix="g" inputMode="decimal" />
            </div>
          </div>
        )}
        {category === 'aktivitet' && (
          <div style={{ marginTop: 14 }}>
            <TextInput value={minutes} onChange={setMinutes} placeholder="Varighed" suffix="min" inputMode="decimal" />
          </div>
        )}
        {category === 'medicin' && (
          <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <TextInput value={medDose} onChange={setMedDose} placeholder="Dosis" inputMode="decimal" />
            </div>
            <UnitPicker value={medUnit} onChange={setMedUnit} />
          </div>
        )}
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '16px 20px 34px',
        background: `linear-gradient(180deg, rgba(244,239,231,0) 0%, ${TOKENS.bg} 40%)`,
      }}>
        <PrimaryButton onClick={submit} disabled={!valid}>Tilføj</PrimaryButton>
      </div>

      {showNewProduct && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          background: TOKENS.bg,
          animation: 'slideInRight 280ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}>
          <NewProductScreen
            app={app}
            onBack={() => setShowNewProduct(false)}
            onComplete={(id) => { setProductId(id); setShowNewProduct(false); }}
          />
        </div>
      )}
    </div>
  );
}

// Maskeret tidsfelt — viser hh:mm med '–' for tomme positioner.
// Kun cifre kan skrives; kolon er fast. Validerer progressivt (timer 00–23, min 00–59).
function MaskedTimeInput({ digits, onChange }) {
  const inputRef = React.useRef(null);
  const d = digits.padEnd(4, '–').split('');
  const hasAny = digits.length > 0;

  const handle = (raw) => {
    let s = raw.replace(/\D/g, '').slice(0, 4);
    if (s.length >= 1 && parseInt(s[0], 10) > 2) s = '2' + s.slice(1);
    if (s.length >= 2) {
      const h = parseInt(s.slice(0, 2), 10);
      if (h > 23) s = '23' + s.slice(2);
    }
    if (s.length >= 3 && parseInt(s[2], 10) > 5) s = s.slice(0, 2) + '5' + s.slice(3);
    onChange(s);
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        display: 'flex', alignItems: 'center',
        background: TOKENS.surface, borderRadius: 14,
        padding: '0 16px', height: 54,
        border: `0.5px solid ${TOKENS.line}`,
        position: 'relative', cursor: 'text',
      }}>
      <div style={{
        ...baseText, flex: 1, fontSize: 17,
        color: hasAny ? TOKENS.ink : TOKENS.inkFaint,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.04em',
        pointerEvents: 'none', userSelect: 'none',
      }}>{d[0]}{d[1]}:{d[2]}{d[3]}</div>
      <input
        ref={inputRef}
        value={digits}
        onChange={e => handle(e.target.value)}
        inputMode="numeric"
        style={{
          position: 'absolute', inset: 0,
          border: 'none', outline: 'none',
          padding: '0 16px', margin: 0,
          background: 'transparent', color: 'transparent',
          caretColor: 'transparent', fontFamily: 'inherit',
        }}
      />
    </div>
  );
}

function ToggleRow({ label, value, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: TOKENS.surface, borderRadius: 14,
      padding: '0 16px', height: 54,
      border: `0.5px solid ${TOKENS.line}`,
    }}>
      <div style={{ ...baseText, flex: 1, fontSize: 15, color: TOKENS.ink, letterSpacing: '-0.01em' }}>{label}</div>
      <button onClick={() => onChange(!value)} style={{
        width: 44, height: 26, borderRadius: 13, padding: 0, border: 'none',
        background: value ? TOKENS.inkSoft : TOKENS.line,
        cursor: 'pointer', position: 'relative',
        transition: 'background 180ms ease',
      }}>
        <div style={{
          position: 'absolute', top: 2, left: value ? 20 : 2,
          width: 22, height: 22, borderRadius: 11, background: TOKENS.bg,
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
          transition: 'left 180ms ease',
        }} />
      </button>
    </div>
  );
}

function CategoryPicker({ value, onChange }) {
  const cats = [['mad', 'Mad'], ['aktivitet', 'Aktivitet'], ['medicin', 'Medicin']];
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {cats.map(([k, lbl]) => (
        <button key={k} onClick={() => onChange(value === k ? null : k)} style={{
          ...baseText, flex: 1, height: 44, borderRadius: 12,
          background: value === k ? TOKENS.ink : TOKENS.surface,
          color: value === k ? TOKENS.bg : TOKENS.ink,
          border: value === k ? 'none' : `0.5px solid ${TOKENS.line}`,
          fontSize: 14, fontWeight: 450, cursor: 'pointer',
          letterSpacing: '-0.01em',
        }}>{lbl}</button>
      ))}
    </div>
  );
}

function ProductPicker({ products, value, onChange, onCreateNew }) {
  return (
    <Card padding={0}>
      <div onClick={onCreateNew} style={{
        padding: '14px 18px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: 10,
          border: `1px dashed ${TOKENS.lineStrong}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="9" height="9" viewBox="0 0 9 9">
            <path d="M4.5 1v7M1 4.5h7" fill="none" stroke={TOKENS.inkMuted}
              strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{
          ...baseText, flex: 1, fontSize: 15, fontWeight: 450,
          color: TOKENS.inkMuted, letterSpacing: '-0.01em',
        }}>Opret nyt produkt</div>
      </div>
      <Divider inset={18} />
      {products.map((p, i) => {
        const sel = p.id === value;
        return (
          <React.Fragment key={p.id}>
            <div onClick={() => onChange(p.id)} style={{
              padding: '14px 18px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 10,
                border: sel ? `6px solid ${TOKENS.inkSoft}` : `1.3px solid ${TOKENS.lineStrong}`,
                background: sel ? TOKENS.bg : 'transparent',
                flexShrink: 0, transition: 'all 140ms ease',
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...baseText, fontSize: 15, fontWeight: 450, color: TOKENS.ink, letterSpacing: '-0.012em' }}>{p.name}</div>
                <div style={{ ...baseText, fontSize: 12, color: TOKENS.inkMuted, marginTop: 3, letterSpacing: '-0.005em' }}>{p.type}{p.kcal100 != null ? ` · ${p.kcal100} kcal/100g` : ''}</div>
              </div>
            </div>
            {i < products.length - 1 && <Divider inset={18} />}
          </React.Fragment>
        );
      })}
    </Card>
  );
}

function UnitPicker({ value, onChange }) {
  const units = ['mg', 'ml', 'andet'];
  return (
    <div style={{
      display: 'flex', background: TOKENS.surface,
      borderRadius: 14, border: `0.5px solid ${TOKENS.line}`,
      padding: 4, gap: 2,
    }}>
      {units.map(u => (
        <button key={u} onClick={() => onChange(u)} style={{
          ...baseText, padding: '0 10px', height: 46, borderRadius: 10,
          background: value === u ? TOKENS.ink : 'transparent',
          color: value === u ? TOKENS.bg : TOKENS.ink,
          border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 450, letterSpacing: '-0.01em',
        }}>{u}</button>
      ))}
    </div>
  );
}

function isTimeInPast(d) {
  const h = parseInt(d.slice(0, 2), 10);
  const m = parseInt(d.slice(2), 10);
  const now = new Date();
  return h * 60 + m < now.getHours() * 60 + now.getMinutes();
}

function digitsToTime(d) {
  return d.slice(0, 2) + ':' + d.slice(2, 4);
}

window.AddPostScreen = AddPostScreen;
