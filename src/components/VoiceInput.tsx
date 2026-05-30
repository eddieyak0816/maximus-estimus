import { useState, useRef, useEffect } from 'react';
import { parseVoiceInput } from '../utils/voiceParser';
import type { VoiceContext, MeasurementUpdate, DrawingCommand } from '../types';

interface Props {
  context: VoiceContext;
  onMeasurements: (updates: MeasurementUpdate[]) => void;
  onDrawingCommands: (commands: DrawingCommand[]) => void;
}

type Stage = 'idle' | 'listening' | 'processing' | 'confirming';

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function VoiceInput({ context, onMeasurements, onDrawingCommands }: Props) {
  const [stage, setStage] = useState<Stage>('idle');
  const [transcript, setTranscript] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [pendingResult, setPendingResult] = useState<{ measurements: MeasurementUpdate[]; drawingCommands: DrawingCommand[] } | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      setError('Web Speech API not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setStage('listening');
      setError('');
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;
        finalTranscript += transcriptSegment + ' ';
      }
      setTranscript(finalTranscript.trim());
    };

    recognition.onend = () => {
      if (stage === 'listening') {
        setStage('processing');
      }
    };

    recognition.onerror = (event: any) => {
      let errorMsg = 'Speech recognition error';
      if (event.error === 'network') {
        errorMsg = 'Network error - check internet connection';
      } else if (event.error === 'no-speech') {
        errorMsg = 'No speech detected - please try again';
      } else if (event.error === 'not-allowed') {
        errorMsg = 'Microphone permission denied';
      }
      setError(errorMsg);
      setStage('idle');
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [stage]);

  useEffect(() => {
    if (stage === 'processing' && transcript) {
      handleProcess();
    }
  }, [stage, transcript]);

  const handleProcess = async () => {
    try {
      const result = await parseVoiceInput(context, transcript);
      if (result.error) {
        setError(result.error);
        setStage('idle');
        return;
      }
      setConfirmation(result.confirmation);
      setPendingResult({
        measurements: result.measurements,
        drawingCommands: result.drawingCommands,
      });
      setStage('confirming');
    } catch (err) {
      setError('Failed to process voice input');
      setStage('idle');
    }
  };

  const handleConfirm = () => {
    if (pendingResult) {
      if (pendingResult.measurements.length > 0) {
        onMeasurements(pendingResult.measurements);
      }
      if (pendingResult.drawingCommands.length > 0) {
        onDrawingCommands(pendingResult.drawingCommands);
      }
    }
    reset();
  };

  const handleCancel = () => {
    reset();
  };

  const reset = () => {
    setStage('idle');
    setTranscript('');
    setConfirmation('');
    setPendingResult(null);
  };

  const handleStartListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  if (!SpeechRecognition) {
    return (
      <div className="voice-input-container">
        <div className="voice-input-fallback">
          <p>Web Speech API not available. Use text input via measurement fields.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="voice-input-container">
      {stage === 'idle' && (
        <button
          className="voice-input-button"
          onClick={handleStartListening}
          title="Click to speak measurements or commands"
        >
          🎤
        </button>
      )}

      {stage === 'listening' && (
        <button className="voice-input-button listening" disabled>
          🎤
        </button>
      )}

      {stage === 'processing' && (
        <div className="voice-input-overlay">
          <div className="voice-input-modal">
            <div className="voice-spinner" />
            <p>Processing...</p>
          </div>
        </div>
      )}

      {stage === 'confirming' && (
        <div className="voice-input-overlay">
          <div className="voice-input-modal">
            <h3>Confirm Voice Input</h3>
            <div className="voice-transcript">
              <p>
                <strong>I heard:</strong> "{transcript}"
              </p>
            </div>
            <div className="voice-confirmation">
              <p>
                <strong>I'll do:</strong> {confirmation}
              </p>
            </div>
            <div className="voice-actions">
              <button className="btn btn-primary" onClick={handleConfirm}>
                ✓ Confirm
              </button>
              <button className="btn btn-ghost" onClick={handleCancel}>
                ✕ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {error && stage === 'idle' && (
        <div className="voice-error-toast">{error}</div>
      )}
    </div>
  );
}
