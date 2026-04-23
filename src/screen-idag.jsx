// Idag — Variant D: date on clean cream, photo starts below it — no top gradient.
// Photo fades into cream at the bottom. Vega + status rest on the gradient.
// Plan card and quick-log sit on clean cream below — Nordic calm preserved.

function IdagScreen({ app, onOpenLogger, onOpenProfile, onAddPost, onEditPost }) {
  const sortedPlan = React.useMemo(
    () => [...app.plan].sort((a, b) => a.time.localeCompare(b.time)),
    [app.plan]
  );
  const planTotal = sortedPlan.length;
  const planDoneCount = sortedPlan.filter(p => app.planDone[p.id]).length;
  const [swipeOpenId, setSwipeOpenId] = React.useState(null);

  // Status line — identity snapshot: age + latest weight, both derived from state.
  const latestKg = app.weights[app.weights.length - 1]?.kg ?? 4.20;
  const kgStr = latestKg.toFixed(1).replace('.', ',') + ' kg';
  const ageStr = ageFromBirthdate(app.birthdate);
  const statusStr = ageStr ? `${ageStr} · ${kgStr}` : kgStr;

  return (
    <div style={{
      position: 'relative', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: TOKENS.bg,
    }}>
      {/* === HERO — starts straight under status bar (dato fjernet — #96) === */}
      <HeroD
        show={app.showPhoto}
        catName={app.catName}
        statusStr={statusStr}
        onOpenProfile={onOpenProfile}
        customPhotoUrl={app.heroPhotoDataUrl}
        offsetY={app.heroPhotoOffsetY}
        iconDark={app.heroIconDark}
        onPickPhoto={(dataUrl) => app.setHeroPhoto(dataUrl)}
        onSaveOffsetY={(v) => app.setHeroPhotoOffsetY(v)}
      />

      {/* === Content below hero — clean cream === */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        flex: 1, minHeight: 0,
        padding: '4px 20px 12px',
      }}>
        {/* Dagens plan */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            padding: '0 6px 10px', flexShrink: 0,
          }}>
            <SectionLabel>Dagens plan</SectionLabel>
            <span style={{
              ...baseText, fontSize: 11, color: TOKENS.inkMuted,
              letterSpacing: '0.02em', fontVariantNumeric: 'tabular-nums',
            }}>{planDoneCount}/{planTotal}</span>
          </div>
          <div style={{
            position: 'relative', flex: 1, minHeight: 0,
            background: TOKENS.surface, borderRadius: 16,
            border: `0.5px solid ${TOKENS.line}`,
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              overflowY: 'auto', overflowX: 'hidden',
              WebkitOverflowScrolling: 'touch',
            }}>
              {sortedPlan.map((item) => {
                const done = app.planDone[item.id];
                return (
                  <div key={item.id}>
                    <SwipeRow
                      open={swipeOpenId === item.id}
                      onOpenChange={(o) => setSwipeOpenId(o ? item.id : null)}
                      onDelete={() => { app.removePlanPost(item.id); setSwipeOpenId(null); }}
                    >
                      <div
                        onClick={() => {
                          if (swipeOpenId === item.id) { setSwipeOpenId(null); return; }
                          onEditPost(item.id);
                        }}
                        style={{
                          display: 'flex', alignItems: 'center',
                          padding: '11px 18px', gap: 14, cursor: 'pointer',
                          background: TOKENS.surface,
                          minHeight: 52,
                        }}
                      >
                        <PlanCheck checked={done} onClick={(e) => { e.stopPropagation(); app.togglePlan(item.id); }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            ...baseText, fontSize: 16, fontWeight: 500,
                            color: done ? TOKENS.inkMuted : TOKENS.ink,
                            letterSpacing: '-0.01em',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>{item.label}</div>
                          {planDetail(item, app.products) && (
                            <div style={{
                              ...baseText, fontSize: 12, marginTop: 3,
                              color: TOKENS.inkMuted, letterSpacing: '-0.005em',
                              fontVariantNumeric: 'tabular-nums',
                            }}>{planDetail(item, app.products)}</div>
                          )}
                        </div>
                        <div style={{
                          ...baseText, fontSize: 14,
                          color: TOKENS.inkMuted, fontVariantNumeric: 'tabular-nums',
                          letterSpacing: '-0.005em',
                        }}>kl. {item.time}</div>
                      </div>
                    </SwipeRow>
                    <Divider inset={52} />
                  </div>
                );
              })}
              <div
                onClick={onAddPost}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '11px 18px', cursor: 'pointer',
                  minHeight: 52,
                }}
              >
                <AddGlyph size={24} />
                {sortedPlan.length === 0 && (
                  <span style={{
                    ...baseText, fontSize: 16, fontWeight: 500,
                    color: TOKENS.inkMuted, letterSpacing: '-0.01em',
                  }}>Tilføj</span>
                )}
              </div>
            </div>
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, height: 24,
              background: `linear-gradient(180deg, rgba(250,246,240,0) 0%, ${TOKENS.surface} 100%)`,
              pointerEvents: 'none', borderRadius: '0 0 16px 16px',
            }} />
          </div>
        </div>

        {/* Hurtig log */}
        <div style={{ padding: '12px 0 0', flexShrink: 0 }}>
          <div style={{ padding: '0 6px 10px' }}>
            <SectionLabel>Hurtig log</SectionLabel>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <QuickActionD label="Foder" onClick={() => onOpenLogger('foder-log')} />
            <QuickActionD label="Vægt" onClick={() => onOpenLogger('vaegt-log')} />
            <QuickActionD label="Obs." onClick={() => onOpenLogger('obs-new')} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Photo starts cleanly — no top gradient. Bottom gradient is long and unhurried,
// fully opaque cream before Vega+status so warm ink always reads.
// Decision #94: long-press → menu; "Rediger foto" enters pan-adjust mode.
function HeroD({ show, catName, statusStr, onOpenProfile, customPhotoUrl, offsetY, iconDark, onPickPhoto, onSaveOffsetY }) {
  // HERO_H er den *synlige* højde under status-bar-området. STATUS_EXTEND er de
  // ekstra px vi strækker hero op under statusbaren — matcher app.jsx's
  // paddingTop: 54. Netto: container = HERO_H + STATUS_EXTEND, flyttet -STATUS_EXTEND
  // opad så bunden (Vega, plan) bliver på samme pixel-position som før.
  const HERO_H = 420;
  const STATUS_EXTEND = 54;
  // Lavere procent viser mere af fotoets top og flytter derfor Vega længere
  // ned i den eksisterende hero-boks, uden at bunden eller layoutet flytter sig.
  const DEFAULT_HERO_Y = 0;
  const fileInputRef = React.useRef(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [adjustMode, setAdjustMode] = React.useState(false);
  const [draftOffsetY, setDraftOffsetY] = React.useState(offsetY);
  const longPressTimer = React.useRef(null);
  const pressStart = React.useRef(null);
  const dragStart = React.useRef(null);

  const hasCustom = !!customPhotoUrl;
  const photoUrl = customPhotoUrl || 'assets/vega-hero.jpg';
  const shownOffsetY = adjustMode ? draftOffsetY : offsetY;
  const photoPositionY = hasCustom ? shownOffsetY : DEFAULT_HERO_Y;

  // Long-press detection (500ms hold w/o significant move) → open menu.
  const onHeroPointerDown = (e) => {
    if (adjustMode) return;
    pressStart.current = { x: e.clientX, y: e.clientY };
    longPressTimer.current = setTimeout(() => {
      setMenuOpen(true);
      longPressTimer.current = null;
    }, 500);
  };
  const onHeroPointerMove = (e) => {
    if (!pressStart.current || !longPressTimer.current) return;
    const dx = e.clientX - pressStart.current.x;
    const dy = e.clientY - pressStart.current.y;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };
  const onHeroPointerUp = () => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
    pressStart.current = null;
  };

  const triggerFilePick = () => {
    setMenuOpen(false);
    fileInputRef.current?.click();
  };
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onPickPhoto(reader.result);
      setDraftOffsetY(50);
      setAdjustMode(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const enterAdjust = () => {
    setMenuOpen(false);
    setDraftOffsetY(offsetY);
    setAdjustMode(true);
  };
  const cancelAdjust = () => {
    setAdjustMode(false);
    setDraftOffsetY(offsetY);
  };
  const saveAdjust = () => {
    onSaveOffsetY(draftOffsetY);
    setAdjustMode(false);
  };

  // Pan-drag in adjust mode: dy in px → offsetY delta (100% over hero height).
  const onAdjustDragDown = (e) => {
    if (!adjustMode) return;
    dragStart.current = { y: e.clientY, startOffset: draftOffsetY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onAdjustDragMove = (e) => {
    if (!dragStart.current) return;
    const dy = e.clientY - dragStart.current.y;
    const deltaPct = (dy / HERO_H) * 100;
    const next = Math.max(0, Math.min(100, dragStart.current.startOffset - deltaPct));
    setDraftOffsetY(next);
  };
  const onAdjustDragUp = (e) => {
    dragStart.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  return (
    <div style={{
      position: 'relative', width: '100%', height: HERO_H + STATUS_EXTEND,
      marginTop: -STATUS_EXTEND,
      flexShrink: 0, overflow: 'hidden',
      background: TOKENS.amberTint,
    }}>
      {/* Status-bar blur-bånd — backdrop-filter over hero-toppen, feathered
          mod bunden så der ingen sømlinje er. Samme recipe som
          IOSGlassPill/IOSKeyboard, men med blødere blur. IOSStatusBar
          (zIndex 10 i ios-frame) ligger ovenpå så ikoner forbliver klare. */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: STATUS_EXTEND + 32, zIndex: 4,
        backdropFilter: 'blur(10px) saturate(140%)',
        WebkitBackdropFilter: 'blur(10px) saturate(140%)',
        maskImage: 'linear-gradient(to bottom, black 0%, black 30%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 30%, transparent 100%)',
        pointerEvents: 'none',
      }} />
      {/* Overlay-statusbar med lyse ikoner når fotoet er mørkt. Overlejrer
          ios-frame'ns default (zIndex 10) med zIndex 11. Ikke-interaktiv. */}
      {iconDark && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 11,
          pointerEvents: 'none',
        }}>
          <IOSStatusBar dark={true} />
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        style={{ display: 'none' }}
      />

      {show && (
        <React.Fragment>
          <div
            onPointerDown={onHeroPointerDown}
            onPointerMove={onHeroPointerMove}
            onPointerUp={onHeroPointerUp}
            onPointerCancel={onHeroPointerUp}
            onContextMenu={(e) => e.preventDefault()}
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${photoUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: `50% ${photoPositionY}%`,
              // Subtle premium lift: a touch more contrast + warmth, no heavy-handed edits.
              filter: 'contrast(1.04) saturate(1.08) brightness(1.02)',
              cursor: adjustMode ? 'grab' : 'default',
              touchAction: adjustMode ? 'none' : 'auto',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }} />
          {/* Adjust-mode drag surface — sits above the photo layer, captures pointer events. */}
          {adjustMode && (
            <div
              onPointerDown={onAdjustDragDown}
              onPointerMove={onAdjustDragMove}
              onPointerUp={onAdjustDragUp}
              onPointerCancel={onAdjustDragUp}
              style={{
                position: 'absolute', inset: 0, zIndex: 5,
                cursor: dragStart.current ? 'grabbing' : 'grab',
                touchAction: 'none',
              }}
            />
          )}
          {/* Fine film grain — SVG turbulence, very low opacity, soft-light blend.
              Adds perceived sharpness and texture without being visible as noise. */}
          <svg style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            opacity: 0.09, mixBlendMode: 'soft-light', pointerEvents: 'none',
          }}>
            <filter id="heroGrain">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#heroGrain)" />
          </svg>
        </React.Fragment>
      )}

      {/* Bottom fade — kortere (160 i stedet for 220) så mere af fotoet er synligt,
          men stadig blød kurve. Bundzonen (Vega+status) forbliver fuldt opaque. */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: 160,
        background: `linear-gradient(180deg,
          rgba(244,239,231,0) 0%,
          rgba(244,239,231,0.2) 35%,
          rgba(244,239,231,0.75) 65%,
          rgba(244,239,231,0.98) 85%,
          ${TOKENS.bg} 100%)`,
        pointerEvents: 'none',
      }} />

      {/* Vega + status — skjules under adjust og menu for at holde hero-fladen ren */}
      {!adjustMode && !menuOpen && (
        <button onClick={onOpenProfile} style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          background: 'transparent', border: 'none',
          padding: '16px 20px 20px', cursor: 'pointer', textAlign: 'left',
        }}>
          <div style={{
            ...baseText, fontSize: 38, fontWeight: 600,
            color: TOKENS.ink, letterSpacing: '-0.035em', lineHeight: 1,
          }}>{catName}</div>
          <div style={{
            ...baseText, marginTop: 6, fontSize: 13, fontWeight: 450,
            color: TOKENS.inkSoft, letterSpacing: '-0.005em',
          }}>{statusStr}</div>
        </button>
      )}

      {/* Long-press menu — subtile knapper i nederste del af hero (over bottom fade).
          Empty-state: kun "Tilføj foto". Custom foto present: "Skift foto" + "Rediger foto". */}
      {menuOpen && (
        <HeroMenuOverlay
          hasCustom={hasCustom}
          onClose={() => setMenuOpen(false)}
          onPick={triggerFilePick}
          onEdit={enterAdjust}
        />
      )}

      {/* Adjust-mode top bar */}
      {adjustMode && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px',
          background: `linear-gradient(180deg, rgba(30,24,18,0.55) 0%, rgba(30,24,18,0) 100%)`,
          pointerEvents: 'none',
        }}>
          <button onClick={cancelAdjust} style={{
            ...baseText, background: 'rgba(255,255,255,0.18)',
            border: 'none', borderRadius: 10,
            color: '#fff', fontSize: 13, fontWeight: 500,
            padding: '7px 14px', cursor: 'pointer',
            letterSpacing: '-0.005em',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            pointerEvents: 'auto',
          }}>Annullér</button>
          <div style={{
            ...baseText, fontSize: 12, fontWeight: 450,
            color: 'rgba(255,255,255,0.85)', letterSpacing: '0.02em',
          }}>Træk op og ned</div>
          <button onClick={saveAdjust} style={{
            ...baseText, background: '#fff',
            border: 'none', borderRadius: 10,
            color: TOKENS.ink, fontSize: 13, fontWeight: 500,
            padding: '7px 14px', cursor: 'pointer',
            letterSpacing: '-0.005em',
            pointerEvents: 'auto',
          }}>Gem</button>
        </div>
      )}
    </div>
  );
}

// Subtile foto-menu-knapper nederst i hero (over bottom fade).
// Matcher grammatikken: cream surface, dark ink, 0.5px line — ingen iOS-chrome.
function HeroMenuOverlay({ hasCustom, onClose, onPick, onEdit }) {
  return (
    <React.Fragment>
      {/* Scrim/tap-outside-to-close — let dæmpning af hero så knapperne står frem */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0, zIndex: 8,
          background: 'rgba(30, 24, 18, 0.18)',
        }}
      />
      <div style={{
        position: 'absolute', left: 20, right: 20, bottom: 20, zIndex: 9,
        display: 'flex', flexDirection: 'column', gap: 8,
        pointerEvents: 'none',
      }}>
        {!hasCustom && (
          <HeroMenuButton label="Tilføj foto" onClick={onPick} />
        )}
        {hasCustom && (
          <React.Fragment>
            <HeroMenuButton label="Rediger foto" onClick={onEdit} />
            <HeroMenuButton label="Skift foto" onClick={onPick} />
          </React.Fragment>
        )}
      </div>
    </React.Fragment>
  );
}

function HeroMenuButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...baseText,
        pointerEvents: 'auto',
        background: TOKENS.surface,
        border: `0.5px solid ${TOKENS.line}`,
        borderRadius: 14,
        padding: '13px 16px',
        fontSize: 15, fontWeight: 450,
        color: TOKENS.ink, letterSpacing: '-0.005em',
        cursor: 'pointer',
        textAlign: 'center',
        boxShadow: '0 4px 14px rgba(30,24,18,0.10)',
      }}
    >{label}</button>
  );
}

// Circle glyph matching PlanCheck's footprint, with a + sign inside.
// Signals "add" without aggressive filled-green iOS style — stays Nordic calm.
function AddGlyph({ size = 24 }) {
  const inner = Math.round(size * 10 / 24);
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2,
      border: `1px dashed ${TOKENS.lineStrong}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <svg width={inner} height={inner} viewBox="0 0 10 10">
        <path d="M5 1v8M1 5h8" fill="none" stroke={TOKENS.inkMuted}
          strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function QuickActionD({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      ...baseText,
      background: TOKENS.surface, border: `0.5px solid ${TOKENS.line}`,
      borderRadius: 16, padding: '14px 8px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
      cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14">
        <path d="M7 2v10M2 7h10" stroke={TOKENS.ink} strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
      <span style={{
        fontSize: 13, fontWeight: 450, color: TOKENS.ink,
        letterSpacing: '-0.01em',
      }}>{label}</span>
    </button>
  );
}

// Detaljelinje under label — kcal (mad), min (aktivitet), dose+unit (medicin).
// Returnerer tom streng hvis detaljer mangler.
function planDetail(item, products) {
  const d = item.details;
  if (!d) return '';
  if (item.category === 'mad') {
    const p = products.find(x => x.id === d.productId);
    if (p && p.kcal100 != null && d.grams) {
      return `${Math.round((p.kcal100 / 100) * d.grams)} kcal`;
    }
    if (d.grams) return `${d.grams} g`;
    return '';
  }
  if (item.category === 'aktivitet' && d.minutes) return `${d.minutes} min`;
  if (item.category === 'medicin' && d.dose != null) {
    return `${d.dose} ${d.unit || ''}`.trim();
  }
  return '';
}

// Swipe-til-venstre afslører en "Slet"-knap bagved.
// Tærskel: > 40px → snap åben (-80), ellers snap tilbage.
function SwipeRow({ children, onDelete, open, onOpenChange }) {
  const [startX, setStartX] = React.useState(null);
  const [dx, setDx] = React.useState(0);
  const moved = React.useRef(false);

  const baseOffset = open ? -80 : 0;
  const live = startX !== null ? baseOffset + dx : baseOffset;
  const clamped = Math.max(-100, Math.min(0, live));

  const onDown = (e) => {
    setStartX(e.clientX);
    setDx(0);
    moved.current = false;
  };
  const onMove = (e) => {
    if (startX === null) return;
    const d = e.clientX - startX;
    if (Math.abs(d) > 4) moved.current = true;
    setDx(d);
  };
  const onUp = () => {
    if (startX === null) return;
    const final = baseOffset + dx;
    onOpenChange(final < -40);
    setStartX(null);
    setDx(0);
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: TOKENS.danger }}>
      <button
        onClick={onDelete}
        style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: 80,
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: '#fff', fontSize: 14, fontWeight: 500,
          letterSpacing: '-0.005em', fontFamily: 'inherit',
        }}
      >Slet</button>
      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onClickCapture={(e) => { if (moved.current) { e.stopPropagation(); e.preventDefault(); moved.current = false; } }}
        style={{
          position: 'relative',
          transform: `translateX(${clamped}px)`,
          transition: startX !== null ? 'none' : 'transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          touchAction: 'pan-y',
        }}
      >{children}</div>
    </div>
  );
}

window.IdagScreen = IdagScreen;
window.SwipeRow = SwipeRow;
