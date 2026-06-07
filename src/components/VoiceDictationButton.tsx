import { useEffect, useRef, useState } from 'react';

interface Props {
  onTranscribed: (text: string) => void;
  label?: string;
}

type RecognitionState = 'idle' | 'listening' | 'processing' | 'error';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VoiceDictationButton({ onTranscribed, label = 'Dictate' }: Props) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [state, setState] = useState<RecognitionState>('idle');
  const [showModal, setShowModal] = useState(false);
  const recognitionRef = useRef<any>(null);
  const interimTranscriptRef = useRef('');
  const lastFinalIndexRef = useRef(-1);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setState('error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setState('listening');
      setTranscript('');
      interimTranscriptRef.current = '';
      lastFinalIndexRef.current = -1;
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let finalText = '';

      // Iterate through all results
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          // Only add final results we haven't seen before
          if (i > lastFinalIndexRef.current) {
            finalText += (finalText ? ' ' : '') + transcript;
            lastFinalIndexRef.current = i;
          }
        } else {
          // Accumulate interim results
          interim += transcript;
        }
      }

      // Update transcript only if there's new final text
      if (finalText) {
        setTranscript(prev => prev + (prev ? ' ' : '') + finalText);
      }

      interimTranscriptRef.current = interim;
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setState('error');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setState('idle');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      lastFinalIndexRef.current = -1;
    };
  }, []);

  function startListening() {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      interimTranscriptRef.current = '';
      setShowModal(true);
      recognitionRef.current.start();
    }
  }

  function stopListening() {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }

  function handleSave() {
    const finalText = transcript + (interimTranscriptRef.current ? ' ' + interimTranscriptRef.current : '');
    if (finalText.trim()) {
      onTranscribed(finalText.trim());
      setTranscript('');
      interimTranscriptRef.current = '';
      setShowModal(false);
      stopListening();
    }
  }

  function handleClear() {
    setTranscript('');
    interimTranscriptRef.current = '';
  }

  function handleClose() {
    stopListening();
    setShowModal(false);
    setTranscript('');
    interimTranscriptRef.current = '';
  }

  if (state === 'error') {
    return (
      <button
        className="btn btn-ghost"
        title="Speech recognition not supported in this browser"
        disabled
        style={{ opacity: 0.5 }}
      >
        🎤 {label}
      </button>
    );
  }

  const displayText = transcript + (interimTranscriptRef.current ? ' ' + interimTranscriptRef.current : '');

  return (
    <>
      <button
        className={`btn ${isListening ? 'btn-primary' : 'btn-ghost'}`}
        onClick={isListening ? stopListening : startListening}
        title={isListening ? 'Stop listening' : 'Start recording'}
        style={{
          animation: isListening ? 'pulse 1.5s infinite' : 'none',
        }}
      >
        🎤 {isListening ? 'Recording...' : label}
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Voice Dictation</h2>
              <button className="modal-close" onClick={handleClose}>✕</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                padding: '12px',
                backgroundColor: isListening ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                borderRadius: '6px',
                minHeight: '30px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
              }}>
                {isListening ? '🔴 Recording...' : '✓ Recording complete'}
              </div>

              <div>
                <div className="tiny-label" style={{ marginBottom: '6px' }}>Transcribed Text</div>
                <textarea
                  value={displayText}
                  onChange={e => setTranscript(e.target.value)}
                  placeholder="Your speech will appear here..."
                  style={{
                    width: '100%',
                    minHeight: '150px',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    color: 'inherit',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={!displayText.trim()}
                  style={{ flex: 1 }}
                >
                  ✓ Save Transcript
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={handleClear}
                  style={{ flex: 1 }}
                >
                  Clear
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={handleClose}
                  style={{ flex: 1 }}
                >
                  Close
                </button>
              </div>

              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                💡 Tip: The app is continuously listening. Click the button again to stop recording, then edit the text if needed and click "Save Transcript".
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </>
  );
}
