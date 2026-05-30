import { useState, useRef, useEffect } from 'react';
import type { LayoutData } from '../types';

type Tool = 'pen' | 'rect' | 'label' | 'eraser';

interface Props {
  data: LayoutData;
  onUpdate: (d: LayoutData) => void;
}

const COLORS = [
  { name: 'white', hex: '#eef2ff' },
  { name: 'navy', hex: '#1F3096' },
  { name: 'yellow', hex: '#F5C42A' },
  { name: 'red', hex: '#f87171' },
  { name: 'green', hex: '#22c55e' },
];

const STROKE_WIDTH = 2;
const ERASER_WIDTH = 20;

export default function LayoutTab({ data, onUpdate }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState(COLORS[0].hex);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [labelText, setLabelText] = useState('');
  const [isPlacingLabel, setIsPlacingLabel] = useState(false);
  const [rectStart, setRectStart] = useState<{ x: number; y: number } | null>(null);

  const canvas = canvasRef.current;
  const ctx = canvas?.getContext('2d');

  useEffect(() => {
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    if (data.canvasData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = data.canvasData;
    } else {
      ctx.fillStyle = '#0d1628';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [canvas, ctx]);

  const saveToHistory = () => {
    if (!canvas || !ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => [...prev.slice(-29), imageData]);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'label') {
      setIsPlacingLabel(true);
      ctx.fillStyle = color;
      ctx.font = '14px system-ui';
      ctx.fillText('•', x, y);
      return;
    }

    if (tool === 'rect') {
      saveToHistory();
      setRectStart({ x, y });
      setIsDrawing(true);
      return;
    }

    saveToHistory();
    setIsDrawing(true);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser') {
      ctx.clearRect(x - ERASER_WIDTH / 2, y - ERASER_WIDTH / 2, ERASER_WIDTH, ERASER_WIDTH);
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = STROKE_WIDTH;
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'rect' && rectStart) {
      const saved = history[history.length - 1];
      if (saved) {
        ctx.putImageData(saved, 0, 0);
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = STROKE_WIDTH;
      ctx.strokeRect(
        Math.min(rectStart.x, x),
        Math.min(rectStart.y, y),
        Math.abs(x - rectStart.x),
        Math.abs(y - rectStart.y)
      );
      return;
    }

    if (tool === 'eraser') {
      ctx.clearRect(x - ERASER_WIDTH / 2, y - ERASER_WIDTH / 2, ERASER_WIDTH, ERASER_WIDTH);
    } else if (tool === 'pen') {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'rect' && rectStart) {
      ctx.strokeStyle = color;
      ctx.lineWidth = STROKE_WIDTH;
      ctx.strokeRect(
        Math.min(rectStart.x, x),
        Math.min(rectStart.y, y),
        Math.abs(x - rectStart.x),
        Math.abs(y - rectStart.y)
      );
      setRectStart(null);
    } else if (tool === 'pen') {
      ctx.closePath();
    }

    setIsDrawing(false);
  };

  const handleUndo = () => {
    if (!canvas || !ctx || history.length === 0) return;

    const newHistory = [...history];
    const imageData = newHistory.pop();

    if (imageData) {
      ctx.putImageData(imageData, 0, 0);
      setHistory(newHistory);
    } else {
      ctx.fillStyle = '#0d1628';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setHistory([]);
    }
  };

  const handleClear = () => {
    if (!canvas || !ctx) return;
    if (!confirm('Clear entire canvas? This cannot be undone.')) return;

    ctx.fillStyle = '#0d1628';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHistory([]);
  };

  const handleSave = () => {
    if (!canvas) return;

    const canvasData = canvas.toDataURL('image/png');
    onUpdate({
      canvasData,
      lastUpdated: new Date().toISOString(),
    });
  };

  const handleAddLabel = () => {
    if (!labelText.trim() || !canvas || !ctx) return;

    if (isPlacingLabel) {
      saveToHistory();
      setLabelText('');
      setIsPlacingLabel(false);
      setTool('pen');
    } else {
      alert('Click on the canvas to place the label.');
    }
  };

  useEffect(() => {
    return () => {
      if (canvas) {
        const canvasData = canvas.toDataURL('image/png');
        if (canvasData !== 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==') {
          onUpdate({
            canvasData,
            lastUpdated: new Date().toISOString(),
          });
        }
      }
    };
  }, [canvas, onUpdate]);

  return (
    <div className="layout-tab">
      <div className="layout-toolbar">
        <button
          className={`btn btn-sm ${tool === 'pen' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTool('pen')}
          title="Freehand pen"
        >
          🖊️ Pen
        </button>

        <button
          className={`btn btn-sm ${tool === 'rect' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTool('rect')}
          title="Draw rectangle"
        >
          ⬜ Rect
        </button>

        <button
          className={`btn btn-sm ${tool === 'label' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTool('label')}
          title="Place text label"
        >
          🔤 Label
        </button>

        <button
          className={`btn btn-sm ${tool === 'eraser' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTool('eraser')}
          title="Eraser"
        >
          🧹 Eraser
        </button>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {COLORS.map(c => (
            <button
              key={c.name}
              className={`layout-color-swatch${color === c.hex ? ' active' : ''}`}
              style={{ backgroundColor: c.hex }}
              onClick={() => setColor(c.hex)}
              title={c.name}
            />
          ))}
        </div>

        <button
          className="btn btn-sm btn-ghost"
          onClick={handleUndo}
          disabled={history.length === 0}
          title="Undo"
        >
          ↩️ Undo
        </button>

        <button className="btn btn-sm btn-ghost" onClick={handleClear} title="Clear canvas">
          🗑️ Clear
        </button>

        <button className="btn btn-sm btn-primary" onClick={handleSave} title="Save layout">
          💾 Save
        </button>
      </div>

      <div className="layout-canvas-wrap">
        <canvas
          ref={canvasRef}
          className="layout-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>

      {isPlacingLabel && (
        <div style={{ padding: '12px', background: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Label text..."
            value={labelText}
            onChange={e => setLabelText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddLabel()}
            autoFocus
            className="input input-sm"
            style={{ flex: 1 }}
          />
          <button className="btn btn-sm btn-primary" onClick={handleAddLabel}>
            OK
          </button>
          <button className="btn btn-sm btn-ghost" onClick={() => setIsPlacingLabel(false)}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
