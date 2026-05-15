import { useEffect, useState } from 'react';
import { fetchDropdownList } from '../utils/dropdownManager';
import type { DropdownOption } from '../utils/dropdownManager';

interface Props {
  listName: string;
  value: string | undefined;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  allowCustom?: boolean;
  className?: string;
}

export default function DropdownSelect({
  listName,
  value,
  onChange,
  label,
  placeholder = 'Select...',
  allowCustom = true,
  className = '',
}: Props) {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        const opts = await fetchDropdownList(listName);
        if (isMounted) {
          setOptions(opts);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(`Failed to load ${listName}`);
          console.error(err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [listName]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setShowCustomInput(true);
      setCustomValue('');
    } else {
      setShowCustomInput(false);
      onChange(val);
    }
  };

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onChange(customValue.trim());
      setShowCustomInput(false);
      setCustomValue('');
    }
  };

  const isCustomValue = value && !options.some(opt => opt.value === value);

  // Sort options alphabetically by label
  const sortedOptions = [...options].sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  return (
    <div className={`dropdown-select-wrapper ${className}`}>
      {label && <label>{label}</label>}
      <select
        value={showCustomInput || isCustomValue ? '__custom__' : value || ''}
        onChange={handleChange}
        disabled={loading}
        className="dropdown-select"
      >
        <option value="">{placeholder}</option>
        {sortedOptions.map(opt => (
          <option key={opt.id} value={opt.value}>
            {opt.label}
          </option>
        ))}
        {allowCustom && <option value="__custom__">Other / Custom</option>}
      </select>
      {error && <div className="dropdown-error">{error}</div>}
      {showCustomInput && (
        <div className="custom-input-group">
          <input
            type="text"
            value={customValue || (isCustomValue ? value : '')}
            onChange={e => setCustomValue(e.target.value)}
            placeholder="Enter custom value..."
            className="custom-input"
            onKeyDown={e => e.key === 'Enter' && handleCustomSubmit()}
          />
          <button
            onClick={handleCustomSubmit}
            className="btn btn-sm btn-primary"
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
}
