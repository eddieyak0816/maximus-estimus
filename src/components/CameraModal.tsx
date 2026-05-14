import { useEffect, useRef, useState } from 'react';

interface Props {
  label: string;
  onCapture: (blob: Blob) => void;
  onClose: () => void;
}

type Stage = 'requesting' | 'camera' | 'preview' | 'error';

export default function CameraModal({ label, onCapture, onClose }: Props) {
  const [stage, setStage] = useState<Stage>('requesting');
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });

        if (!mounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStage('camera');
      } catch (err) {
        if (mounted) {
          const msg = err instanceof Error ? err.message : 'Camera access denied';
          setError(msg);
          setStage('error');
        }
      }
    }

    startCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  function handleCapture() {
    if (!videoRef.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setPreviewSrc(url);
        setStage('preview');
      }
    }, 'image/jpeg', 0.85);
  }

  function handleKeep() {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        onCapture(blob);
        cleanup();
      }
    }, 'image/jpeg', 0.85);
  }

  function handleRetake() {
    if (previewSrc) URL.revokeObjectURL(previewSrc);
    setPreviewSrc('');
    setStage('camera');
  }

  function cleanup() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (previewSrc) URL.revokeObjectURL(previewSrc);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={cleanup}>
      <div className="modal-content camera-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{label}</h2>
          <button className="modal-close" onClick={cleanup}>✕</button>
        </div>

        {stage === 'requesting' && (
          <div className="modal-body camera-loading">
            <div className="spinner"></div>
            <p>Requesting camera access…</p>
          </div>
        )}

        {stage === 'camera' && (
          <div className="modal-body camera-view">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }}
            />
            <div className="camera-controls">
              <button className="btn btn-primary" onClick={handleCapture}>
                📸 Take Photo
              </button>
              <button className="btn btn-ghost" onClick={cleanup}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {stage === 'preview' && (
          <div className="modal-body camera-view">
            <img
              src={previewSrc}
              alt="Preview"
              style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }}
            />
            <div className="camera-controls">
              <button className="btn btn-success" onClick={handleKeep}>
                ✓ Keep
              </button>
              <button className="btn btn-ghost" onClick={handleRetake}>
                🔄 Retake
              </button>
            </div>
          </div>
        )}

        {stage === 'error' && (
          <div className="modal-body camera-error">
            <div style={{ color: '#ef4444', marginBottom: '1rem' }}>⚠️ Camera Error</div>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</p>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
              Make sure your browser has permission to access the camera, or try using a different browser.
            </p>
            <button className="btn btn-primary" onClick={cleanup}>
              Close
            </button>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}
