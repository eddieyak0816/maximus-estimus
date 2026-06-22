import { useState } from 'react';
import type { AIExtractData, AIWallData } from '../types';
import AIWallCard from './AIWallCard';

interface Props {
  aiExtract?: AIExtractData;
  onUpdate: (data: AIExtractData) => void;
}

export default function AIExtractTab({ aiExtract, onUpdate }: Props) {
  const [expandedWallId, setExpandedWallId] = useState<string | null>(null);

  const walls = aiExtract?.walls || [];

  function handleUpdateWall(updatedWall: AIWallData) {
    if (!aiExtract) return;
    const updated = {
      walls: walls.map(w => (w.id === updatedWall.id ? updatedWall : w)),
    };
    onUpdate(updated);
  }

  function handleDeleteWall(wallId: string) {
    if (!aiExtract) return;
    const updated = {
      walls: walls.filter(w => w.id !== wallId),
    };
    onUpdate(updated);
  }

  if (walls.length === 0) {
    return (
      <div className="assess-tab">
        <div style={{
          padding: '24px',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '13px',
        }}>
          No AI extractions yet. Dictate measurements and click "Apply to Form" to populate this section.
        </div>
      </div>
    );
  }

  return (
    <div className="assess-tab">
      <div style={{ marginBottom: '16px', padding: '0 0 12px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.6)' }}>
          {walls.length} wall{walls.length !== 1 ? 's' : ''} extracted from AI parsing
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {walls.map(wall => (
          <AIWallCard
            key={wall.id}
            wall={wall}
            isExpanded={expandedWallId === wall.id}
            onToggle={() => setExpandedWallId(expandedWallId === wall.id ? null : wall.id)}
            onUpdate={handleUpdateWall}
            onDelete={handleDeleteWall}
          />
        ))}
      </div>
    </div>
  );
}
