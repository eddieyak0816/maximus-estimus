import { useState, useRef, useEffect } from 'react';
import type { LayoutData, WallData } from '../types';

type Tool = 'pen' | 'rect' | 'label' | 'eraser' | 'wall';
type WallDirection = 'horizontal' | 'vertical' | 'diagonal' | null;

interface Props {
  data: LayoutData;
  onUpdate: (d: LayoutData) => void;
  onWallPlaced?: (x: number, y: number, direction: WallDirection) => void;
  onWallDelete?: (wallIndex: number) => void;
  onWallEdit?: (wallIndex: number) => void;
  walls?: WallData[];
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
const SCALE_FACTOR = 0.5; // 1 inch = 0.5 pixels (120" = 60px on canvas)
const WALL_COLOR = '#F5C42A'; // Yellow
const WALL_WIDTH = 4;

export default function LayoutTab({ data, onUpdate, onWallPlaced, onWallDelete, onWallEdit, walls = [] }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState(COLORS[0].hex);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [labelText, setLabelText] = useState('');
  const [isPlacingLabel, setIsPlacingLabel] = useState(false);
  const [rectStart, setRectStart] = useState<{ x: number; y: number } | null>(null);
  const [wallDirection, setWallDirection] = useState<WallDirection>(null);
  const [selectedWallIndex, setSelectedWallIndex] = useState<number | null>(null);

  const canvas = canvasRef.current;
  const ctx = canvas?.getContext('2d');

  // Auto-initialize canvas by triggering rect tool on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setTool('rect');
      setTimeout(() => setTool('pen'), 50);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const resizeObserver = new ResizeObserver(() => {
      const ctx = canvasEl.getContext('2d');
      if (!ctx) return;

      const rect = canvasEl.parentElement?.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) return;

      canvasEl.width = rect.width;
      canvasEl.height = rect.height;

      if (data.canvasData) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0);
        img.src = data.canvasData;
      } else {
        ctx.fillStyle = '#0d1628';
        ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
      }
    });

    const parent = canvasEl.parentElement;
    if (parent) {
      resizeObserver.observe(parent);
    }

    return () => resizeObserver.disconnect();
  }, [data.canvasData]);

  // Draw walls whenever walls data changes
  useEffect(() => {
    if (!canvas || !ctx) return;

    // Just redraw walls on top of current canvas (preserves freehand drawings)
    drawWallsToScale();
  }, [walls, canvas, ctx]);

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

    // Check for wall selection when not using a drawing tool
    if (tool === 'pen' && !isDrawing) {
      try {
        const wallIndex = getWallAtPoint(x, y);
        if (wallIndex !== null) {
          console.log('🎯 Wall selected:', wallIndex);
          setSelectedWallIndex(wallIndex);
          return;
        } else {
          setSelectedWallIndex(null);
        }
      } catch (error) {
        console.error('❌ Error selecting wall:', error);
        setSelectedWallIndex(null);
      }
    }

    if (tool === 'wall' && wallDirection) {
      saveToHistory();

      // Draw wall line
      const wallLength = 60; // Default visual length on canvas
      ctx.strokeStyle = '#F5C42A';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x, y);

      if (wallDirection === 'horizontal') {
        ctx.lineTo(x + wallLength, y);
      } else if (wallDirection === 'vertical') {
        ctx.lineTo(x, y + wallLength);
      } else if (wallDirection === 'diagonal') {
        ctx.lineTo(x + wallLength * 0.707, y + wallLength * 0.707);
      }
      ctx.stroke();

      // Call callback to open measurement dialog
      if (onWallPlaced) {
        onWallPlaced(x, y, wallDirection);
      }

      setWallDirection(null);
      setTool('pen');
      return;
    }

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
    autoSaveCanvas();
  };

  const autoSaveCanvas = () => {
    if (!canvas) return;
    const canvasData = canvas.toDataURL('image/png');
    onUpdate({
      canvasData,
      lastUpdated: new Date().toISOString(),
    });
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
    autoSaveCanvas();
  };

  const handleClear = () => {
    if (!canvas || !ctx) return;
    if (!confirm('Clear entire canvas? This cannot be undone.')) return;

    ctx.fillStyle = '#0d1628';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHistory([]);
    autoSaveCanvas();
  };

  const getWallAtPoint = (x: number, y: number): number | null => {
    if (!walls || walls.length === 0) return null;

    const WALL_LABELS = ['A', 'B', 'C', 'D'];
    const START_X = 80;
    const START_Y = 80;
    const SPACING_X = 350;
    const SPACING_Y = 200;
    const HIT_DISTANCE = 20; // Pixels from wall line to count as a hit

    for (let index = 0; index < walls.length; index++) {
      const wall = walls[index];
      if (!wall.length) continue;

      const numericLength = parseFloat(String(wall.length));
      if (numericLength <= 0) continue;

      const pixelLength = numericLength * SCALE_FACTOR;
      const row = Math.floor(index / 2);
      const col = index % 2;
      const startX = START_X + col * SPACING_X;
      const startY = START_Y + row * SPACING_Y;

      const direction = wall.direction || 'horizontal';
      let endX, endY;

      if (direction === 'vertical') {
        endX = startX;
        endY = startY + pixelLength;
      } else if (direction === 'diagonal') {
        endX = startX + pixelLength * 0.707;
        endY = startY + pixelLength * 0.707;
      } else {
        endX = startX + pixelLength;
        endY = startY;
      }

      // Distance from point to line segment
      const A = x - startX;
      const B = y - startY;
      const C = endX - startX;
      const D = endY - startY;

      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = -1;

      if (lenSq !== 0) param = dot / lenSq;

      let xx, yy;
      if (param < 0) {
        xx = startX;
        yy = startY;
      } else if (param > 1) {
        xx = endX;
        yy = endY;
      } else {
        xx = startX + param * C;
        yy = startY + param * D;
      }

      const dx = x - xx;
      const dy = y - yy;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < HIT_DISTANCE) {
        return index;
      }
    }

    return null;
  };

  const drawWallsToScale = () => {
    if (!canvas || !ctx) return;

    const WALL_LABELS = ['A', 'B', 'C', 'D'];
    const START_X = 80;
    const START_Y = 80;
    const SPACING_X = 350;
    const SPACING_Y = 200;
    const WALL_ZONE_HEIGHT = 500; // Height of the zone where walls are drawn

    // Clear the wall drawing zone (top part of canvas) to avoid layering old walls
    ctx.fillStyle = '#0d1628';
    ctx.fillRect(0, 0, canvas.width, WALL_ZONE_HEIGHT);

    if (!walls || walls.length === 0) return;

    walls.forEach((wall, index) => {
      if (!wall.length) return; // Skip walls without length

      // Parse length (e.g., "15 ft", "15'", "120"")
      const numericLength = parseFloat(String(wall.length));
      if (numericLength <= 0) return; // Only draw walls with positive length

      const pixelLength = numericLength * SCALE_FACTOR;
      const label = wall.name || WALL_LABELS[index];

      // Position: A & B in row 1, C & D in row 2, E & F in row 3, etc.
      const row = Math.floor(index / 2);
      const col = index % 2;
      const startX = START_X + col * SPACING_X;
      const startY = START_Y + row * SPACING_Y;

      // Draw the wall line
      ctx.strokeStyle = WALL_COLOR;
      ctx.lineWidth = WALL_WIDTH;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startX, startY);

      // Direction: wall.direction should be 'horizontal', 'vertical', or 'diagonal'
      const direction = wall.direction || 'horizontal';
      if (direction === 'vertical') {
        ctx.lineTo(startX, startY + pixelLength);
      } else if (direction === 'diagonal') {
        ctx.lineTo(startX + pixelLength * 0.707, startY + pixelLength * 0.707);
      } else {
        // Default to horizontal
        ctx.lineTo(startX + pixelLength, startY);
      }
      ctx.stroke();

      // Draw wall label above the line
      ctx.fillStyle = WALL_COLOR;
      ctx.font = 'bold 16px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(label, startX + pixelLength / 2, startY - 12);

      // Draw wall length below the line
      ctx.fillStyle = 'rgba(245, 196, 42, 0.8)';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`${wall.length}`, startX + pixelLength / 2, startY + 8);
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
  }, [canvas]);

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

        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', height: '24px', margin: '0 6px' }} />

        <button
          className={`btn btn-sm ${tool === 'wall' && wallDirection === 'horizontal' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => { setTool('wall'); setWallDirection('horizontal'); }}
          title="Place horizontal wall"
        >
          ➡️ H-Wall
        </button>

        <button
          className={`btn btn-sm ${tool === 'wall' && wallDirection === 'vertical' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => { setTool('wall'); setWallDirection('vertical'); }}
          title="Place vertical wall"
        >
          ⬇️ V-Wall
        </button>

        <button
          className={`btn btn-sm ${tool === 'wall' && wallDirection === 'diagonal' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => { setTool('wall'); setWallDirection('diagonal'); }}
          title="Place diagonal wall"
        >
          ↘️ D-Wall
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

      {selectedWallIndex !== null && walls && walls.length > selectedWallIndex && walls[selectedWallIndex] && (
        <div style={{
          padding: '12px',
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1 }}>
            <strong>Wall {String.fromCharCode(65 + selectedWallIndex)}</strong>
            {walls[selectedWallIndex]?.name && ` - ${walls[selectedWallIndex].name}`}
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Length: {walls[selectedWallIndex]?.length || '—'} | Direction: {walls[selectedWallIndex]?.direction || 'horizontal'}
            </div>
          </div>
          {onWallEdit && (
            <button className="btn btn-sm btn-primary" onClick={() => {
              console.log('📝 Editing wall:', selectedWallIndex);
              onWallEdit(selectedWallIndex);
            }}>
              ✎ Edit
            </button>
          )}
          {onWallDelete && (
            <button className="btn btn-sm btn-ghost" onClick={() => {
              console.log('🗑️ Deleting wall:', selectedWallIndex);
              onWallDelete(selectedWallIndex);
              setSelectedWallIndex(null);
            }}>
              🗑️ Delete
            </button>
          )}
          <button className="btn btn-sm btn-ghost" onClick={() => setSelectedWallIndex(null)}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
