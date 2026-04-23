// Foder log flow — pick product, enter grams, see kcal.
// Also: new product creation.

function FoderLogScreen({ app, onBack, onComplete, initialDate }) {
  const today = window.localISO();
  const activeProducts = app.products.filter(p => !p.archived);
  const [selectedId, setSelectedId] = React.useState(activeProducts[0]?.id);
  const [grams, setGrams] = React.useState('');
  const [timeDigits, setTimeDigits] = React.useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
  });
  const [step, setStep] = React.useState('pick'); // pick | grams
  const [showNewProduct, setShowNewProduct] = React.useState(false);
  const [date, setDate] = React.useState(initialDate || today);
  const [showDateSheet, setShowDateSheet] = React.useState(false);
  const [linkedPlanId, setLinkedPlanId] = React.useState(null);

  const selected = app.products.find(p => p.id === selectedId);
  const gramsNum = parseFloat((grams || '').replace(',', '.')) || 0;
  const hasKcal = selected && selected.kcal100 != null;
  const kcal = hasKcal ? Math.round((selected.kcal100 / 100) * gramsNum) : 0;
  const validTime = timeDigits.length === 4;

  // Plan-poster på valgt dato, kategori=mad, ikke completede — som valgfri kobling.
  const linkablePlans = React.useMemo(() => {
    if (date !== today) return []; // kun planen for i dag har aktuel relevans
    return app.plan
      .filter(p => p.category === 'mad' && !app.planDone[p.id])
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [app.plan, app.planDone, date, today]);

  const submit = () => {
    if (!selected || gramsNum <= 0 || !validTime) return;
    app.addFoodLog({
      productId: selected.id,
      grams: gramsNum,
      time: digitsToTime(timeDigits),
      date,
      planId: linkedPlanId,
    });
    onComplete();
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Log foder" onBack={step === 'pick' ? onBack : () => setStep('pick')} />

      {step === 'pick' ? (
        <div style={{ flex: 1, padding: '0 20px 120px', overflow: 'auto' }}>
          <div style={{ marginBottom: 20 }}>
            <DateRow date={date} onOpen={() => setShowDateSheet(true)} />
          </div>
          <div style={{ padding: '0 6px 12px' }}>
            <SectionLabel>Vælg produkt</SectionLabel>
          </div>
          <Card padding={0}>
            <div
              onClick={() => setShowNewProduct(true)}
              style={{
                padding: '14px 18px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
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
            {activeProducts.map((p, i) => (
              <React.Fragment key={p.id}>
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
                {i < activeProducts.length - 1 && <Divider inset={18} />}
              </React.Fragment>
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

          {/* Tidspunkt */}
          <div style={{ padding: '0 6px 10px' }}>
            <SectionLabel>Tidspunkt</SectionLabel>
          </div>
          <MaskedTimeInput digits={timeDigits} onChange={setTimeDigits} />

          {/* Grams input */}
          <div style={{ padding: '22px 6px 10px' }}>
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

          {/* Valgfri kobling til plan-post */}
          {linkablePlans.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <div style={{ padding: '0 6px 10px' }}>
                <SectionLabel>Er dette fra planen? <span style={{ color: TOKENS.inkFaint, textTransform: 'none', letterSpacing: '-0.005em', fontWeight: 400, marginLeft: 4 }}>valgfrit</span></SectionLabel>
              </div>
              <PlanLinkPicker
                plans={linkablePlans}
                value={linkedPlanId}
                onChange={setLinkedPlanId}
              />
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
          <PrimaryButton onClick={submit} disabled={gramsNum <= 0 || !validTime}>
            {hasKcal && kcal > 0 ? `Log ${kcal} kcal` : 'Log foder'}
          </PrimaryButton>
        </div>
      )}

      {showDateSheet && (
        <DateSheet
          value={date}
          onSelect={(iso) => { setDate(iso); setShowDateSheet(false); }}
          onClose={() => setShowDateSheet(false)}
        />
      )}

      {showNewProduct && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          background: TOKENS.bg,
          animation: 'slideInRight 280ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}>
          <NewProductScreen
            app={app}
            onBack={() => setShowNewProduct(false)}
            onComplete={(id) => { setSelectedId(id); setShowNewProduct(false); setStep('grams'); }}
          />
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
    const id = app.addProduct({
      name: name.trim(),
      type,
      kcal100: kcalNum > 0 ? kcalNum : null,
    });
    onComplete(id);
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
              color: type === t ? TOKENS.bg : TOKENS.ink,
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

// Radio-liste over ikke-completede mad-plan-poster på den valgte dato,
// plus en "Ingen"-mulighed. Tap toggler (samme valg = fravælg).
function PlanLinkPicker({ plans, value, onChange }) {
  const row = (key, label, sub, isSel, onClick) => (
    <div key={key} onClick={onClick} style={{
      padding: '14px 18px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: 10,
        border: isSel ? `6px solid ${TOKENS.inkSoft}` : `1.3px solid ${TOKENS.lineStrong}`,
        background: isSel ? TOKENS.bg : 'transparent',
        flexShrink: 0, transition: 'all 140ms ease',
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...baseText, fontSize: 15, fontWeight: 450, color: TOKENS.ink, letterSpacing: '-0.012em' }}>{label}</div>
        {sub && <div style={{ ...baseText, fontSize: 12, color: TOKENS.inkMuted, marginTop: 3, letterSpacing: '-0.005em', fontVariantNumeric: 'tabular-nums' }}>{sub}</div>}
      </div>
    </div>
  );
  return (
    <Card padding={0}>
      {plans.map((p, i) => (
        <React.Fragment key={p.id}>
          {row(p.id, p.label, `kl. ${p.time}`, value === p.id, () => onChange(value === p.id ? null : p.id))}
          <Divider inset={18} />
        </React.Fragment>
      ))}
      {row('none', 'Ikke fra planen', null, value === null, () => onChange(null))}
    </Card>
  );
}

window.FoderLogScreen = FoderLogScreen;
window.NewProductScreen = NewProductScreen;
window.PlanLinkPicker = PlanLinkPicker;
