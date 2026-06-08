import { useState } from 'react';
import { parseTranscriptWithHuggingFace } from '../utils/parseTranscriptWithHuggingFace';

export interface DictationTranscript {
  id: string;
  text: string;
  timestamp: string;
  processed: boolean;
}

interface ParsedResult {
  measurements: Record<string, string | number | boolean>;
  questions: Record<string, string | string[] | boolean>;
  notes: string;
  confidence: 'high' | 'medium' | 'low';
}

interface Props {
  transcripts: DictationTranscript[];
  onAddTranscript?: (text: string) => void;
  onDeleteTranscript: (id: string) => void;
  jobType?: 'Kitchen' | 'Bathroom' | 'Flooring' | 'Painting' | 'Living Room' | 'Bedroom' | 'Deck';
}

export default function DictationTranscriptsPanel({ transcripts, onDeleteTranscript, jobType = 'Kitchen' }: Props) {
  const [showRawPanel, setShowRawPanel] = useState(false);
  const [parsingId, setParsingId] = useState<string | null>(null);
  const [parsedResults, setParsedResults] = useState<Record<string, ParsedResult>>({});

  async function handleParseTranscript(id: string, text: string) {
    const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    if (!apiKey) {
      alert('Hugging Face API key not configured. Please set VITE_HUGGINGFACE_API_KEY in GitHub secrets.');
      return;
    }

    setParsingId(id);
    try {
      const result = await parseTranscriptWithHuggingFace(text, apiKey, jobType);
      setParsedResults({ ...parsedResults, [id]: result });
    } catch (err) {
      console.error('Failed to parse transcript:', err);
      alert(`Failed to parse transcript: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setParsingId(null);
    }
  }

  if (!showRawPanel && transcripts.length === 0) {
    return null;
  }

  return (
    <>
      <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'rgba(245, 196, 42, 0.05)', borderRadius: '6px', border: '1px solid rgba(245, 196, 42, 0.2)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onClick={() => setShowRawPanel(!showRawPanel)}
        >
          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--accent)' }}>
            📝 Raw Dictations ({transcripts.length})
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
            {showRawPanel ? '▼' : '▶'}
          </div>
        </div>

        {showRawPanel && (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {transcripts.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                No dictations yet. Use the 🎤 Dictate button to record voice notes.
              </div>
            ) : (
              transcripts.map((transcript) => {
                const parsed = parsedResults[transcript.id];
                return (
                  <div key={transcript.id}>
                    <div
                      style={{
                        padding: '8px',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '4px',
                        borderLeft: '3px solid var(--accent)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '8px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
                            {new Date(transcript.timestamp).toLocaleString()}
                          </div>
                          <div style={{ fontSize: '13px', wordBreak: 'break-word', lineHeight: '1.4' }}>
                            {transcript.text}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                          <button
                            className="btn btn-ghost"
                            onClick={() => handleParseTranscript(transcript.id, transcript.text)}
                            disabled={parsingId === transcript.id}
                            title="Parse with Claude AI"
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                          >
                            {parsingId === transcript.id ? '⏳' : '🤖'}
                          </button>
                          <button
                            className="btn btn-ghost"
                            onClick={() => onDeleteTranscript(transcript.id)}
                            title="Delete"
                            style={{ padding: '4px 8px', fontSize: '12px', color: '#ef4444' }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>

                    {parsed && (
                      <div
                        style={{
                          marginTop: '6px',
                          padding: '8px',
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          borderRadius: '4px',
                          borderLeft: '3px solid #22c55e',
                          fontSize: '12px',
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: '6px', color: '#22c55e' }}>
                          ✓ Parsed Results (Confidence: {parsed.confidence})
                        </div>
                        {Object.keys(parsed.measurements).length > 0 && (
                          <div style={{ marginBottom: '6px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)' }}>Measurements:</div>
                            <div style={{ marginLeft: '8px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>
                              {Object.entries(parsed.measurements).map(([key, value]) => (
                                <div key={key}>• {key}: <strong>{String(value)}</strong></div>
                              ))}
                            </div>
                          </div>
                        )}
                        {Object.keys(parsed.questions).length > 0 && (
                          <div style={{ marginBottom: '6px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)' }}>Answers:</div>
                            <div style={{ marginLeft: '8px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>
                              {Object.entries(parsed.questions).map(([key, value]) => (
                                <div key={key}>• {key}: <strong>{String(value)}</strong></div>
                              ))}
                            </div>
                          </div>
                        )}
                        {parsed.notes && (
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)' }}>Notes:</div>
                            <div style={{ marginLeft: '8px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>
                              {parsed.notes}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </>
  );
}
