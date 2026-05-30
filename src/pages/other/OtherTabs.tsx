import type { OtherAssessment } from '../../types';

type Tab = 'measurements' | 'questions' | 'photos' | 'layout';

interface Props {
  data: OtherAssessment;
  activeTab: Tab;
  onUpdate: (d: OtherAssessment) => void;
}

export default function OtherTabs({ data, activeTab, onUpdate }: Props) {
  if (activeTab === 'measurements') {
    return (
      <div className="assess-tab">
        <div className="other-empty-state">
          <div className="other-empty-icon">📐</div>
          <div className="other-empty-title">Custom Job Type</div>
          <p className="assess-hint">Use the notes field below to document any measurements for this job.</p>
        </div>
        <textarea
          className="textarea"
          rows={10}
          placeholder="Measurement notes for this job…"
          value={data.measurementNotes || ''}
          onChange={e => onUpdate({ ...data, measurementNotes: e.target.value })}
        />
      </div>
    );
  }

  if (activeTab === 'questions') {
    return (
      <div className="assess-tab">
        <div className="other-empty-state">
          <div className="other-empty-icon">📋</div>
          <div className="other-empty-title">Custom Job Type</div>
          <p className="assess-hint">Use the notes field below to document any questions and answers for this job.</p>
        </div>
        <textarea
          className="textarea"
          rows={10}
          placeholder="Questions and answers for this job…"
          value={data.questionNotes || ''}
          onChange={e => onUpdate({ ...data, questionNotes: e.target.value })}
        />
      </div>
    );
  }

  if (activeTab === 'layout') {
    return (
      <div className="assess-tab">
        <div className="other-empty-state">
          <div className="other-empty-icon">📐</div>
          <div className="other-empty-title">Room Layout</div>
          <p className="assess-hint">Sketch the room layout for this custom job type.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="assess-tab">
      <div className="other-empty-state">
        <div className="other-empty-icon">📷</div>
        <div className="other-empty-title">Custom Job Type</div>
        <p className="assess-hint">Use the notes field below to document what photos were taken for this job.</p>
      </div>
      <textarea
        className="textarea"
        rows={10}
        placeholder="Photo notes for this job…"
        value={data.photoNotes || ''}
        onChange={e => onUpdate({ ...data, photoNotes: e.target.value })}
      />
    </div>
  );
}
