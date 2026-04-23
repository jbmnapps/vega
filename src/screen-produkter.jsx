// Produkter — dedicated product library screen. Pushed from Foder.
// Swipe-til-venstre sletter et produkt (samme mønster som plan-poster).

function ProdukterScreen({ app, onBack }) {
  const [showNewProduct, setShowNewProduct] = React.useState(false);
  const [swipeOpenId, setSwipeOpenId] = React.useState(null);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <ScreenHeader title="Produkter" onBack={onBack} />

      <div style={{ flex: 1, overflow: 'auto', padding: '0 20px 120px' }}>
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
          {(() => {
            const activeProducts = app.products.filter(p => !p.archived);
            return (
              <>
                {activeProducts.length > 0 && <Divider inset={18} />}
                {activeProducts.map((p, i) => (
                  <div key={p.id}>
                    <SwipeRow
                      open={swipeOpenId === p.id}
                      onOpenChange={(o) => setSwipeOpenId(o ? p.id : null)}
                      onDelete={() => { app.removeProduct(p.id); setSwipeOpenId(null); }}
                    >
                      <div style={{
                        padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
                        background: TOKENS.surface,
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            ...baseText, fontSize: 15, fontWeight: 450, color: TOKENS.ink,
                            letterSpacing: '-0.012em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>{p.name}</div>
                          <div style={{ ...baseText, fontSize: 12, color: TOKENS.inkMuted, marginTop: 3, letterSpacing: '-0.005em' }}>{p.type}</div>
                        </div>
                        {p.kcal100 != null ? (
                          <div style={{ ...baseText, fontSize: 13, color: TOKENS.inkMuted, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.005em' }}>{p.kcal100} kcal/100g</div>
                        ) : (
                          <div style={{ ...baseText, fontSize: 12, color: TOKENS.inkFaint, letterSpacing: '-0.005em' }}>uden kcal</div>
                        )}
                      </div>
                    </SwipeRow>
                    {i < activeProducts.length - 1 && <Divider inset={18} />}
                  </div>
                ))}
              </>
            );
          })()}
        </Card>
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
            onComplete={() => setShowNewProduct(false)}
          />
        </div>
      )}
    </div>
  );
}

window.ProdukterScreen = ProdukterScreen;
