// Foder log flow — pick product, enter grams, see kcal.
// Also: new product creation.

function FoderLogScreen({ app, onBack, onComplete }) {
  const [selectedId, setSelectedId] = React.useState(app.products[0]?.id);
  const [grams, setGrams] = React.useState('');
  const [step, setStep] = React.useState('pick'); // pick | grams

  const selected = app.products.find(p => p.id === selectedId);
  const gramsNum = parseFloat((grams || '').replace(',', '.')) || 0;
  const hasKcal = selected && selected.kcal100 != null;
  const kcal = hasKcal ? Math.round((selected.kcal100 / 100) * gramsNum) : 0;

  const submit = () => {
    if (!selected || gramsNum <= 0) return;
    app.addFoodLog(selected.id, gramsNum);
    app.completePlanFromFood();
    onComplete();
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Log foder" onBack={step === 'pick' ? onBack : () => setStep('pick')} />

      {step === 'pick' ? (
        <div style={{ flex: 1, padding: '0 20px 120px', overflow: 'auto' }}>
          <div style={{ padding: '0 6px 12px' }}>
            <SectionLabel>Vælg produkt</SectionLabel>
          </div>
          <Card padding={0}>
            {app.products.map((p, i) => (
              <div key={p.id}>
                <div
                  onClick={() => { setSelectedId(p.id); setStep('grams'); }}
                  style={{
                    padding: '16px 18px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      ...baseText, fontSize: 15, fontWeight: 450,
                      color: TOKENS.ink, letterSpacing: '-0.012em',
                    }}>{p.name}</div>
                    <div style={{
                      ...baseText, fontSize: 12, color: TOKENS.inkMuted,
                      marginTop: 3, letterSpacing: '-0.005em',
                    }}>{p.type}{p.kcal100 != null ? ` · ${p.kcal100} kcal/100g` : ''}</div>
                  </div>
                  <svg width="8" height="14" viewBox="0 0 8 14" style={{ flexShrink: 0 }}>
                    <path d="M1 1l6 6-6 6" stroke={TOKENS.inkFaint}
                      strokeWidth="1.4" fill="none" strokeLinecap="round"/>
                  </svg>
                </div>
                {i < app.products.length - 1 && <Divider inset={18} />}
              </div>
            ))}
          </Card>
        </div>
      ) : (
        <div style={{ flex: 1, padding: '0 20px 120px', overflow: 'auto' }}>
          {/* Product summary */}
          <Card padding={18} style={{ marginBottom: 20 }}>
            <div style={{
              ...baseText, fontSize: 12, color: TOKENS.inkMuted,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>Produkt</div>
            <div style={{
              ...baseText, fontSize: 17, fontWeight: 450, color: TOKENS.ink,
              marginTop: 4, letterSpacing: '-0.015em',
            }}>{selected?.name}</div>
            <div style={{
              ...baseText, fontSize: 12, color: TOKENS.inkMuted,
              marginTop: 2, letterSpacing: '-0.005em',
            }}>{hasKcal ? `${selected.kcal100} kcal/100g` : 'Uden kcal'}</div>
          </Card>

          {/* Grams input */}
          <div style={{ padding: '0 6px 10px' }}>
            <SectionLabel>Mængde</SectionLabel>
          </div>
          <TextInput
            value={grams}
            onChange={setGrams}
            placeholder="0"
            suffix="g"
            inputMode="decimal"
            autoFocus
          />

          {/* Result — only shown if kcal data exists */}
          {hasKcal && (
            <div style={{ marginTop: 28, textAlign: 'center' }}>
              <div style={{
                ...baseText, fontSize: 12, color: TOKENS.inkMuted,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>Kalorier</div>
              <div style={{
                ...baseText, fontSize: 54, fontWeight: 300,
                color: gramsNum > 0 ? TOKENS.ink : TOKENS.inkFaint,
                letterSpacing: '-0.04em', marginTop: 8,
                fontVariantNumeric: 'tabular-nums',
              }}>{kcal}<span style={{ fontSize: 22, color: TOKENS.inkMuted, marginLeft: 6 }}>kcal</span></div>
            </div>
          )}
        </div>
      )}

      {step === 'grams' && (
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          padding: '16px 20px 34px',
          background: `linear-gradient(180deg, rgba(244,239,231,0) 0%, ${TOKENS.bg} 40%)`,
        }}>
          <PrimaryButton onClick={submit} disabled={gramsNum <= 0}>
            {hasKcal && kcal > 0 ? `Log ${kcal} kcal` : 'Log foder'}
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}

function NewProductScreen({ app, onBack, onComplete }) {
  const [name, setName] = React.useState('');
  const [type, setType] = React.useState('Tørfoder');
  const [kcal, setKcal] = React.useState('');

  const valid = name.trim();
  const submit = () => {
    if (!valid) return;
    const kcalNum = parseFloat((kcal || '').replace(',', '.'));
    app.addProduct({
      name: name.trim(),
      type,
      kcal100: kcalNum > 0 ? kcalNum : null,
    });
    onComplete();
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Nyt produkt" onBack={onBack} />
      <div style={{ flex: 1, padding: '0 20px 120px', overflow: 'auto' }}>
        <div style={{ padding: '0 6px 10px' }}>
          <SectionLabel>Navn</SectionLabel>
        </div>
        <TextInput value={name} onChange={setName} placeholder="F.eks. Hill’s Science Plan" autoFocus />

        <div style={{ padding: '20px 6px 10px' }}>
          <SectionLabel>Type</SectionLabel>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Tørfoder', 'Vådfoder', 'Snack'].map(t => (
            <button key={t} onClick={() => setType(t)} style={{
              ...baseText, flex: 1, height: 44, borderRadius: 12,
              background: type === t ? TOKENS.ink : TOKENS.surface,
              color: type === t ? '#f4efe7' : TOKENS.ink,
              border: type === t ? 'none' : `0.5px solid ${TOKENS.line}`,
              fontSize: 14, fontWeight: 450, cursor: 'pointer',
              letterSpacing: '-0.01em',
            }}>{t}</button>
          ))}
        </div>

        <div style={{ padding: '20px 6px 10px' }}>
          <SectionLabel>Kalorier <span style={{ color: TOKENS.inkFaint, textTransform: 'none', letterSpacing: '-0.005em', fontWeight: 400, marginLeft: 4 }}>valgfrit</span></SectionLabel>
        </div>
        <TextInput value={kcal} onChange={setKcal}
          placeholder="— valgfrit —" suffix="kcal / 100g" inputMode="decimal" />
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '16px 20px 34px',
        background: `linear-gradient(180deg, rgba(244,239,231,0) 0%, ${TOKENS.bg} 40%)`,
      }}>
        <PrimaryButton onClick={submit} disabled={!valid}>
          Gem produkt
        </PrimaryButton>
      </div>
    </div>
  );
}

window.FoderLogScreen = FoderLogScreen;
window.NewProductScreen = NewProductScreen;
