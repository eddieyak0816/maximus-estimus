import { useState } from 'react';

export interface DictationTranscript {
  id: string;
  text: string;
  timestamp: string;
  processed: boolean;
}

interface Props {
  transcripts: DictationTranscript[];
  onAddTranscript?: (text: string) => void;
  onDeleteTranscript: (id: string) => void;
  onParseWithAI?: (text: string) => Promise<string>;
}

export default function DictationTranscriptsPanel({ transcripts, onDeleteTranscript, onParseWithAI }: Props) {
  const [showRawPanel, setShowRawPanel] = useState(false);
  const [parsingId, setParsingId] = useState<string | null>(null);

  async function handleParseTranscript(id: string, text: string) {
    if (!onParseWithAI) return;

    setParsingId(id);
    try {
      const parsed = await onParseWithAI(text);
      console.log('Parsed transcript:', parsed);
      // In Phase 2, this will auto-populate fields
      alert('AI parsing complete! (Phase 2 will auto-populate fields)\n\nParsed data:\n' + parsed);
    } catch (err) {
      console.error('Failed to parse transcript:', err);
      alert('Failed to parse transcript. Please try again.');
    } finally {
      setParsingId(null);
    }
  }

  if (!showRawPanel && transcripts.length === 0) {
    return null;
  }

  return (
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
            transcripts.map((transcript) => (
              <div
                key={transcript.id}
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
                    {onParseWithAI && (
                      <button
                        className="btn btn-ghost"
                        onClick={() => handleParseTranscript(transcript.id, transcript.text)}
                        disabled={parsingId === transcript.id}
                        title="Parse with AI (Phase 2)"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                      >
                        {parsingId === transcript.id ? '⏳' : '🤖'}
                      </button>
                    )}
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
            ))
          )}
        </div>
      )}
    </div>
  );
}
