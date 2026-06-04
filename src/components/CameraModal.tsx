import { useEffect, useRef, useState } from 'react';

interface Props {
  label: string;
  onCapture: (blob: Blob) => void;
  onClose: () => void;
  burstMode?: boolean;
}

type Stage = 'choice' | 'requesting' | 'camera' | 'preview' | 'error';

export default function CameraModal({ label, onCapture, onClose, burstMode = false }: Props) {
  const [stage, setStage] = useState<Stage>(burstMode ? 'requesting' : 'choice');
  const [error, setError] = useState<string>('');
  const [burstCount, setBurstCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewSrc, setPreviewSrc] = useState<string>('');

  // Auto-start camera in burst mode
  useEffect(() => {
    if (burstMode) {
      requestAndStartCamera();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function requestAndStartCamera() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported in this browser or context.');
      }

      console.log('Requesting camera access...');
      let stream: MediaStream | null = null;

      // Try environment-facing camera first (back camera on phone)
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
      } catch (e) {
        console.log('Environment camera failed, trying any camera:', e);
        // Fall back to any available camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (!stream) {
        console.log('No stream acquired');
        return;
      }

      console.log('Stream acquired, setting up video element');
      streamRef.current = stream;
      setStage('camera');
    } catch (err) {
      console.error('Camera error:', err);
      const msg = err instanceof Error ? err.message : 'Camera not available';
      setError(msg);
      setStage('error');
    }
  }

  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (stage !== 'camera' || !video || !stream) return;

    video.srcObject = stream;
    video.play().catch(err => {
      console.warn('Camera video playback did not start automatically:', err);
    });
  }, [stage]);

  function handleCapture() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = video.videoWidth || video.width;
    const height = video.videoHeight || video.height;

    if (width === 0 || height === 0) {
      setError('Camera not ready. Please wait a moment and try again.');
      setStage('error');
      return;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      if (burstMode) {
        onCapture(blob);
        setBurstCount(c => c + 1);
        // Stay on camera stage — ready for next shot
      } else {
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
      } else {
        setError('Failed to process photo. Please try again.');
        setStage('error');
      }
    }, 'image/jpeg', 0.85);
  }

  function handleRetake() {
    if (previewSrc) URL.revokeObjectURL(previewSrc);
    setPreviewSrc('');
    setStage('camera');
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              onCapture(blob);
              cleanup();
            }
          }, 'image/jpeg', 0.85);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  async function startTakePhoto() {
    setStage('requesting');
    await requestAndStartCamera();
  }

  function cleanup() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
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

        {stage === 'choice' && (
          <div className="modal-body camera-loading">
            <p style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>How would you like to add a photo?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="btn btn-primary" onClick={startTakePhoto} style={{ width: '100%' }}>
                📷 Take Photo
              </button>
              <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()} style={{ width: '100%' }}>
                📁 Upload Photo
              </button>
              <button className="btn btn-ghost" onClick={cleanup} style={{ width: '100%' }}>
                Cancel
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>
        )}

        {stage === 'requesting' && (
          <div className="modal-body camera-loading">
            <div className="spinner"></div>
            <p>Requesting camera access…</p>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '1rem' }}>
              On your phone, tap "Allow" when prompted
            </p>
          </div>
        )}

        {stage === 'camera' && (
          <div className="modal-body camera-view">
            {burstMode && burstCount > 0 && (
              <div style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem' }}>
                ✓ {burstCount} photo{burstCount !== 1 ? 's' : ''} saved
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '400px',
                minHeight: '300px',
                objectFit: 'cover',
                backgroundColor: '#000',
                borderRadius: '8px',
                display: 'block'
              }}
            />
            <div className="camera-controls">
              <button className="btn btn-primary" onClick={handleCapture}>
                📸 Take Photo
              </button>
              {burstMode ? (
                <button className="btn btn-success" onClick={cleanup}>
                  ✓ Done
                </button>
              ) : (
                <button className="btn btn-ghost" onClick={cleanup}>
                  Cancel
                </button>
              )}
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
