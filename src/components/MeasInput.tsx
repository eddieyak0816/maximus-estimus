import { useState } from 'react';

interface Props {
  label: string;
  value?: string;
  onChange?: (v: string) => void;
  hint?: string;
}

export default function MeasInput({ label, value = '', onChange, hint }: Props) {
  const [unit, setUnit] = useState<'"' | "'">(`"`);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!onChange) return;
    const v = e.target.value.trim().replace(/['"]/g, '');
    if (v) onChange(v + unit);
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const u = e.target.value as '"' | "'";
    setUnit(u);
    if (!onChange || !value) return;
    const v = value.replace(/['"]/g, '').trim();
    if (v) onChange(v + u);
  };

  const displayVal = value.replace(/['"]/g, '');

  return (
    <div className="meas-field">
      <div className="meas-label">{label}</div>
      {hint && <div className="meas-hint">{hint}</div>}
      <div className="meas-input-row">
        <input
          className="meas-input"
          placeholder="0"
          value={displayVal}
          onChange={e => onChange?.(e.target.value)}
          onBlur={handleBlur}
          inputMode="decimal"
        />
        <select className="meas-unit" value={unit} onChange={handleUnitChange}>
          <option value={`"`}>″</option>
          <option value={`'`}>′</option>
        </select>
      </div>
    </div>
  );
}
