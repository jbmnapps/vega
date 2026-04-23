// Profile — cat identity + editable metadata. Modal sheet, opened from Idag.

function ProfileScreen({ app, onBack }) {
  const [editing, setEditing] = React.useState(false);
  const fileInputRef = React.useRef(null);

  const onPickFile = () => fileInputRef.current?.click();
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => app.setHeroPhoto(reader.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

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
            <ProfileRow
              label={app.heroPhotoDataUrl ? 'Skift foto' : 'Tilføj foto'}
              value=""
              chevron
              onClick={onPickFile}
            />
            {app.heroPhotoDataUrl && (
              <React.Fragment>
                <Divider inset={18} />
                <ProfileRow
                  label="Fjern foto"
                  value=""
                  onClick={() => app.removeHeroPhoto()}
                  danger
                />
              </React.Fragment>
            )}
            <Divider inset={18} />
            <ProfileRow label="Indstillinger" value="" chevron />
          </Card>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}

function ProfileRow({ label, value, chevron, editing, onChange, inputType, rawValue, suffix, placeholder, onClick, danger }) {
  const editable = editing && typeof onChange === 'function';
  const clickable = !editable && typeof onClick === 'function';

  return (
    <div
      onClick={clickable ? onClick : undefined}
      style={{
        padding: '16px 18px', display: 'flex', alignItems: 'center',
        cursor: clickable ? 'pointer' : 'default',
      }}>
      <div style={{ ...baseText, flex: 1, fontSize: 15, color: danger ? TOKENS.danger : TOKENS.ink, letterSpacing: '-0.01em' }}>{label}</div>
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

window.ProfileScreen = ProfileScreen;
