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
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [state, setState] = useState<RecognitionState>('idle');
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [useKeyboardInput, setUseKeyboardInput] = useState(false);
  const [keyboardText, setKeyboardText] = useState('');
  const keyboardInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const interimTranscriptRef = useRef('');

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setState('error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    // Force English US for consistency across devices
    recognition.lang = 'en-US';

    // Android fix: These settings help with Android's different behavior
    (recognition as any).oninterimresults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setState('listening');
      setTranscript('');
      interimTranscriptRef.current = '';
      setErrorMessage('');
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let finalTranscript = '';

      // Build final transcript from all final results
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript || '';

        if (event.results[i].isFinal) {
          // Trim and add only if it's not empty
          const trimmed = transcript.trim();
          if (trimmed) {
            finalTranscript += trimmed + ' ';
          }
        } else {
          // For interim, only use the latest one (Android fix: avoid accumulating interim)
          interim = transcript;
        }
      }

      // Set transcript to the complete final transcript (trimmed of extra spaces)
      const finalTrimmed = finalTranscript.trim();
      if (finalTrimmed) {
        setTranscript(finalTrimmed);
      }

      interimTranscriptRef.current = interim;
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);

      // Android-specific error handling
      if (event.error === 'network') {
        setErrorMessage('Network error. Check your connection and try again.');
      } else if (event.error === 'no-speech') {
        setErrorMessage('No speech detected. Make sure your microphone is working.');
      } else if (event.error === 'audio-capture') {
        setErrorMessage('Microphone not available. Check permissions and try again.');
      } else if (event.error === 'permission-denied') {
        setErrorMessage('Microphone permission denied. Allow access in settings.');
      } else {
        setErrorMessage(`Error: ${event.error}`);
      }

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

  function pauseListening() {
    if (recognitionRef.current && isListening && !isPaused) {
      recognitionRef.current.stop();
      setIsPaused(true);
      setIsListening(false);
    }
  }

  function resumeListening() {
    if (recognitionRef.current && isPaused) {
      setIsPaused(false);
      recognitionRef.current.start();
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
    setUseKeyboardInput(false);
    setErrorMessage('');
    setKeyboardText('');
  }

  function handleSaveKeyboardInput() {
    if (keyboardText.trim()) {
      onTranscribed(keyboardText.trim());
      setKeyboardText('');
      handleClose();
    }
  }

  function focusKeyboardInput() {
    if (keyboardInputRef.current) {
      keyboardInputRef.current.focus();
      keyboardInputRef.current.click();
    }
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

            {/* Tab selector */}
            <div style={{ display: 'flex', gap: '8px', padding: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <button
                onClick={() => setUseKeyboardInput(false)}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '4px',
                  border: 'none',
                  background: !useKeyboardInput ? 'var(--accent)' : 'rgba(255, 255, 255, 0.1)',
                  color: !useKeyboardInput ? '#0d1628' : 'inherit',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                🎤 Web Speech
              </button>
              <button
                onClick={() => setUseKeyboardInput(true)}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '4px',
                  border: 'none',
                  background: useKeyboardInput ? 'var(--accent)' : 'rgba(255, 255, 255, 0.1)',
                  color: useKeyboardInput ? '#0d1628' : 'inherit',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                ⌨️ Keyboard
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {!useKeyboardInput ? (
                // Web Speech API mode
                <>
                  {errorMessage && (
                    <div style={{
                      padding: '12px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      borderRadius: '6px',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      fontSize: '13px',
                    }}>
                      ⚠️ {errorMessage}
                    </div>
                  )}

              <div style={{
                padding: '12px',
                backgroundColor: isListening ? 'rgba(239, 68, 68, 0.1)' : isPaused ? 'rgba(245, 196, 42, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                borderRadius: '6px',
                minHeight: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '14px',
              }}>
                <div>
                  {isListening ? '🔴 Recording...' : isPaused ? '⏸ Paused' : '✓ Ready'}
                </div>
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

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {!isListening && !isPaused ? (
                  <button
                    className="btn btn-primary"
                    onClick={startListening}
                    style={{ flex: '1 1 calc(50% - 4px)', minWidth: '100px' }}
                  >
                    🎤 Start Recording
                  </button>
                ) : isListening && !isPaused ? (
                  <>
                    <button
                      className="btn btn-ghost"
                      onClick={pauseListening}
                      style={{ flex: '1 1 calc(50% - 4px)', minWidth: '100px' }}
                    >
                      ⏸ Pause
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={stopListening}
                      style={{ flex: '1 1 calc(50% - 4px)', minWidth: '100px' }}
                    >
                      ⏹ Stop
                    </button>
                  </>
                ) : isPaused ? (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={resumeListening}
                      style={{ flex: '1 1 calc(50% - 4px)', minWidth: '100px' }}
                    >
                      ▶ Resume
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={stopListening}
                      style={{ flex: '1 1 calc(50% - 4px)', minWidth: '100px' }}
                    >
                      ⏹ Stop
                    </button>
                  </>
                ) : null}

                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={!displayText.trim()}
                  style={{ flex: '1 1 calc(50% - 4px)', minWidth: '100px' }}
                >
                  ✓ Save
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={handleClear}
                  style={{ flex: '1 1 calc(50% - 4px)', minWidth: '100px' }}
                >
                  Clear
                </button>
              </div>

              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', lineHeight: '1.4' }}>
                💡 Tips: Click "Start Recording" to begin. Use "Pause" to take breaks between thoughts. Click "Resume" to continue. When done, click "Stop" then "Save".
              </div>
                </>
              ) : (
                // Keyboard input mode
                <>
                  <div style={{ padding: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px', fontSize: '13px', lineHeight: '1.5' }}>
                    💡 <strong>Native Android Speech Recognition</strong><br/>
                    Tap the microphone icon on your keyboard to use Android's native speech recognition (like Gemini).
                  </div>

                  <div>
                    <div className="tiny-label" style={{ marginBottom: '6px' }}>Your text will appear here:</div>
                    <input
                      ref={keyboardInputRef}
                      type="text"
                      value={keyboardText}
                      onChange={e => setKeyboardText(e.target.value)}
                      placeholder="Tap the microphone button on your keyboard to speak"
                      autoFocus={useKeyboardInput}
                      autoComplete="off"
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '6px',
                        border: keyboardText ? '1px solid var(--accent)' : '1px solid rgba(255, 255, 255, 0.2)',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        color: 'inherit',
                        fontFamily: 'inherit',
                        fontSize: '14px',
                        minHeight: '44px',
                        transition: 'border-color 0.2s',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-primary"
                      onClick={focusKeyboardInput}
                      style={{ flex: '1 1 calc(50% - 4px)', minWidth: '100px' }}
                    >
                      📱 Show Keyboard
                    </button>
                    <button
                      className={`btn ${keyboardText.trim() ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={handleSaveKeyboardInput}
                      style={{ flex: '1 1 calc(50% - 4px)', minWidth: '100px' }}
                    >
                      {keyboardText.trim() ? '✓ Save' : '(Enter text)'}
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() => {
                        setKeyboardText('');
                        focusKeyboardInput();
                      }}
                      disabled={!keyboardText}
                      style={{ flex: '1 1 calc(50% - 4px)', minWidth: '100px' }}
                    >
                      Clear
                    </button>
                  </div>

                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', lineHeight: '1.4' }}>
                    💡 Steps:<br/>
                    1. Click "Show Keyboard"<br/>
                    2. Tap the microphone 🎤 button on your keyboard<br/>
                    3. Speak naturally<br/>
                    4. Click "Save" when done
                  </div>
                </>
              )}
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
