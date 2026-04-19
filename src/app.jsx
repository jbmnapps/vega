// App shell — wires tabs, modals, tweaks panel, edit mode.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dayState": "midday",
  "showPhoto": true,
  "catName": "Vega"
}/*EDITMODE-END*/;

function App() {
  const app = useAppState();
  const [tab, setTab] = React.useState('idag');
  const [modal, setModal] = React.useState(null); // 'foder-log' | 'vaegt-log' | 'obs-new' | 'foder-new-product' | 'profile'
  const [tweaksOpen, setTweaksOpen] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);

  // Persist tab position for refresh-continuity
  React.useEffect(() => {
    const saved = localStorage.getItem('mycat-tab');
    if (saved) setTab(saved);
  }, []);
  React.useEffect(() => {
    localStorage.setItem('mycat-tab', tab);
  }, [tab]);

  // Apply initial tweak defaults
  React.useEffect(() => {
    if (TWEAK_DEFAULTS.dayState) app.setDay(TWEAK_DEFAULTS.dayState);
    app.setShowPhoto(TWEAK_DEFAULTS.showPhoto !== false);
  }, []);

  // Edit mode protocol
  React.useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') setEditMode(true);
      if (e.data?.type === '__deactivate_edit_mode') setEditMode(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const persist = (edits) => {
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*');
  };

  const onOpenLogger = (kind) => setModal(kind);
  const onCloseModal = () => setModal(null);

  const renderScreen = () => {
    if (tab === 'idag') return <IdagScreen app={app} onOpenLogger={onOpenLogger} onOpenProfile={() => setModal('profile')} onAddPost={() => setModal('add-post')} />;
    if (tab === 'foder') return <FoderScreen app={app} onOpenLogger={onOpenLogger} />;
    if (tab === 'vaegt') return <VaegtScreen app={app} onOpenLogger={onOpenLogger}
      onOpenDetail={() => setModal('vaegt-detail')}
      onOpenMalinger={() => setModal('vaegt-malinger')} />;
    if (tab === 'obs') return <ObservationerScreen app={app} onOpenLogger={onOpenLogger} />;
    if (tab === 'tid') return <TidslinjeScreen app={app} />;
    return null;
  };

  const renderModal = () => {
    if (!modal) return null;
    const common = {
      onBack: onCloseModal,
      onComplete: () => { onCloseModal(); },
    };
    let content;
    if (modal === 'foder-log') content = <FoderLogScreen app={app} {...common} />;
    else if (modal === 'foder-new-product') content = <NewProductScreen app={app} {...common} />;
    else if (modal === 'vaegt-log') content = <VaegtLogScreen app={app} {...common} />;
    else if (modal === 'vaegt-detail') content = <VaegtDetailScreen app={app} {...common} />;
    else if (modal === 'vaegt-malinger') content = <MalingerScreen app={app} {...common} />;
    else if (modal === 'obs-new') content = <ObsNewScreen app={app} {...common} />;
    else if (modal === 'profile') content = <ProfileScreen app={app} {...common} />;
    else if (modal === 'add-post') content = <AddPostScreen app={app} {...common} />;

    return (
      <div style={{
        position: 'absolute', inset: 0, zIndex: 60,
        background: TOKENS.bg,
        animation: 'slideUp 280ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}>
        {content}
      </div>
    );
  };

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      background: TOKENS.bg, overflow: 'hidden',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{ width: '100%', height: '100%', overflow: tab === 'idag' ? 'hidden' : 'auto', paddingTop: 54, paddingBottom: tab === 'idag' ? 90 : 0 }}>
        {renderScreen()}
      </div>
      <TabBar active={tab} onSelect={setTab} />
      {renderModal()}

      {/* Tweaks FAB when edit mode is on */}
      {editMode && !tweaksOpen && (
        <button onClick={() => setTweaksOpen(true)} style={{
          position: 'absolute', bottom: 100, right: 16, zIndex: 70,
          width: 44, height: 44, borderRadius: 22,
          background: TOKENS.ink, color: TOKENS.bg, border: 'none',
          boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Inter', fontSize: 18,
        }}>⚙</button>
      )}

      {editMode && tweaksOpen && (
        <TweaksPanel
          app={app}
          onClose={() => setTweaksOpen(false)}
          onPersist={persist}
        />
      )}
    </div>
  );
}

function ProfileScreen({ app, onBack }) {
  const [editing, setEditing] = React.useState(false);

  const ageStr = ageFromBirthdate(app.birthdate);
  const subtitle = ageStr ? `Hunkat · ${ageStr}` : 'Hunkat';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader
        title=""
        onBack={onBack}
        trailing={
          <button onClick={() => setEditing(e => !e)} style={{
            ...baseText, background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 15, color: TOKENS.ink, letterSpacing: '-0.005em',
            padding: '4px 8px',
            fontWeight: editing ? 500 : 400,
          }}>{editing ? 'Færdig' : 'Rediger'}</button>
        }
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '0 0 120px' }}>
        <div style={{
          padding: '20px 24px 28px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <VegaAvatar size={160} showPhoto={app.showPhoto} />
          {editing ? (
            <input
              type="text"
              value={app.catName}
              onChange={(e) => app.setCatName(e.target.value)}
              style={{
                ...baseText, marginTop: 20, fontSize: 30, fontWeight: 500,
                color: TOKENS.ink, letterSpacing: '-0.03em',
                background: 'transparent', border: 'none',
                borderBottom: `1px solid ${TOKENS.line}`,
                textAlign: 'center', outline: 'none', padding: '2px 4px',
                width: 200,
              }}
            />
          ) : (
            <div style={{
              ...baseText, marginTop: 20, fontSize: 30, fontWeight: 500,
              color: TOKENS.ink, letterSpacing: '-0.03em',
            }}>{app.catName}</div>
          )}
          <div style={{
            ...baseText, marginTop: 6, fontSize: 13, color: TOKENS.inkMuted,
            letterSpacing: '-0.005em',
          }}>{subtitle}</div>
        </div>

        <div style={{ padding: '0 20px' }}>
          <Card padding={0}>
            <ProfileRow
              label="Fødselsdag"
              value={fmtDate(app.birthdate)}
              editing={editing}
              inputType="date"
              rawValue={app.birthdate}
              onChange={(v) => app.setBirthdate(v)}
            />
            <Divider inset={18} />
            <ProfileRow
              label="Race"
              value={app.breed}
              editing={editing}
              onChange={(v) => app.setBreed(v)}
            />
            <Divider inset={18} />
            <ProfileRow
              label="Dagligt mål"
              value={app.kcalTarget == null ? 'Ikke sat' : `${app.kcalTarget} kcal`}
              editing={editing}
              inputType="number"
              rawValue={app.kcalTarget == null ? '' : String(app.kcalTarget)}
              placeholder="Ikke sat"
              suffix="kcal"
              onChange={(v) => {
                const trimmed = (v || '').trim();
                if (trimmed === '') { app.setKcalTarget(null); return; }
                const n = parseInt(trimmed, 10);
                app.setKcalTarget(Number.isFinite(n) && n > 0 ? n : null);
              }}
            />
            <Divider inset={18} />
            <ProfileRow
              label="Dyrlæge"
              value={app.vet}
              editing={editing}
              onChange={(v) => app.setVet(v)}
            />
          </Card>
        </div>

        <div style={{ padding: '20px 20px' }}>
          <Card padding={0}>
            <ProfileRow label="Skift foto" value="" chevron />
            <Divider inset={18} />
            <ProfileRow label="Indstillinger" value="" chevron />
          </Card>
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ label, value, chevron, editing, onChange, inputType, rawValue, suffix, placeholder }) {
  const editable = editing && typeof onChange === 'function';

  return (
    <div style={{
      padding: '16px 18px', display: 'flex', alignItems: 'center',
    }}>
      <div style={{ ...baseText, flex: 1, fontSize: 15, color: TOKENS.ink, letterSpacing: '-0.01em' }}>{label}</div>
      {editable ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input
            type={inputType || 'text'}
            value={rawValue ?? value}
            placeholder={placeholder || ''}
            onChange={(e) => onChange(e.target.value)}
            style={{
              ...baseText, fontSize: 15, color: TOKENS.ink,
              letterSpacing: '-0.005em',
              background: TOKENS.bg,
              border: `0.5px solid ${TOKENS.line}`,
              borderRadius: 6, padding: '4px 8px',
              outline: 'none', textAlign: 'right',
              width: inputType === 'number' ? 70 : inputType === 'date' ? 150 : 180,
              fontFamily: 'inherit',
            }}
          />
          {suffix && (
            <div style={{ ...baseText, fontSize: 15, color: TOKENS.inkMuted, letterSpacing: '-0.005em' }}>{suffix}</div>
          )}
        </div>
      ) : value ? (
        <div style={{ ...baseText, fontSize: 15, color: TOKENS.inkMuted, letterSpacing: '-0.005em' }}>{value}</div>
      ) : null}
      {chevron && !editing && (
        <svg width="8" height="14" viewBox="0 0 8 14" style={{ marginLeft: 6 }}>
          <path d="M1 1l6 6-6 6" stroke={TOKENS.inkFaint} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        </svg>
      )}
    </div>
  );
}

function TweaksPanel({ app, onClose, onPersist }) {
  return (
    <div style={{
      position: 'absolute', bottom: 100, right: 16, left: 16, zIndex: 80,
      background: TOKENS.surface, borderRadius: 20,
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      border: `0.5px solid ${TOKENS.line}`,
      padding: 18,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ ...baseText, fontSize: 15, fontWeight: 500, color: TOKENS.ink, letterSpacing: '-0.01em' }}>Tweaks</div>
        <button onClick={onClose} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: TOKENS.inkMuted, fontSize: 18, padding: 4,
        }}>×</button>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{
          ...baseText, fontSize: 11, color: TOKENS.inkMuted,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          marginBottom: 8,
        }}>Dag</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
          {[
            ['morning', 'Morgen'],
            ['midday', 'Middag'],
            ['evening', 'Aften'],
            ['complete', 'Færdig'],
          ].map(([val, lbl]) => (
            <button key={val} onClick={() => { app.setDay(val); onPersist({ dayState: val }); }} style={{
              ...baseText, padding: '8px 4px', borderRadius: 8,
              background: app.day === val ? TOKENS.ink : 'transparent',
              color: app.day === val ? TOKENS.bg : TOKENS.ink,
              border: app.day === val ? 'none' : `0.5px solid ${TOKENS.line}`,
              fontSize: 11.5, cursor: 'pointer', letterSpacing: '-0.01em',
            }}>{lbl}</button>
          ))}
        </div>
      </div>

      <div>
        <div style={{
          ...baseText, fontSize: 11, color: TOKENS.inkMuted,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          marginBottom: 8,
        }}>Foto</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => { app.setShowPhoto(true); onPersist({ showPhoto: true }); }} style={{
            ...baseText, flex: 1, padding: '8px 4px', borderRadius: 8,
            background: app.showPhoto ? TOKENS.ink : 'transparent',
            color: app.showPhoto ? TOKENS.bg : TOKENS.ink,
            border: app.showPhoto ? 'none' : `0.5px solid ${TOKENS.line}`,
            fontSize: 11.5, cursor: 'pointer', letterSpacing: '-0.01em',
          }}>Med foto</button>
          <button onClick={() => { app.setShowPhoto(false); onPersist({ showPhoto: false }); }} style={{
            ...baseText, flex: 1, padding: '8px 4px', borderRadius: 8,
            background: !app.showPhoto ? TOKENS.ink : 'transparent',
            color: !app.showPhoto ? TOKENS.bg : TOKENS.ink,
            border: !app.showPhoto ? 'none' : `0.5px solid ${TOKENS.line}`,
            fontSize: 11.5, cursor: 'pointer', letterSpacing: '-0.01em',
          }}>Uden foto</button>
        </div>
      </div>
    </div>
  );
}

window.App = App;
