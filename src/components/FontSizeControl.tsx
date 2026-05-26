import { useFontScale } from '../contexts/FontScaleContext';

export default function FontSizeControl() {
  const { scale, increment, decrement, reset } = useFontScale();
  const isDefault = Math.abs(scale - 1) < 0.01;

  return (
    <div className="font-size-control">
      <button
        onClick={decrement}
        className="font-size-btn"
        title="Decrease font size (10%)"
        aria-label="Decrease font size"
      >
        A−
      </button>
      <button
        onClick={reset}
        className={`font-size-btn ${isDefault ? 'active' : ''}`}
        title="Reset to default font size"
        aria-label="Reset font size"
      >
        A
      </button>
      <button
        onClick={increment}
        className="font-size-btn"
        title="Increase font size (10%)"
        aria-label="Increase font size"
      >
        A+
      </button>
    </div>
  );
}
