import { useFontSize, type FontSize } from '../hooks/useFontSize';

export default function FontSizeControl() {
  const { fontSize, setFontSize } = useFontSize();

  const sizes: Array<{ label: string; value: FontSize }> = [
    { label: 'A-', value: 'small' },
    { label: 'A', value: 'normal' },
    { label: 'A+', value: 'large' },
  ];

  return (
    <div className="font-size-control">
      {sizes.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => setFontSize(value)}
          className={`font-size-btn ${fontSize === value ? 'active' : ''}`}
          title={`${value.charAt(0).toUpperCase() + value.slice(1)} font size`}
          aria-label={`${value} font size`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
