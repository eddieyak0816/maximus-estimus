import type { LivingRoomQuestions } from '../../types';

interface Props {
  data: LivingRoomQuestions;
  onUpdate: (d: LivingRoomQuestions) => void;
}

function SecHead({ title }: { title: string }) {
  return <div className="q-sec-head">{title}</div>;
}

export default function LivingRoomQuestions({ data, onUpdate }: Props) {
  const u = (key: keyof LivingRoomQuestions, val: unknown) => onUpdate({ ...data, [key]: val });

  const toggleMulti = (key: keyof LivingRoomQuestions, value: string) => {
    const arr = (data[key] as string[]) || [];
    const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
    u(key, next);
  };

  return (
    <div className="assess-tab">
      <SecHead title="Project Scope" />

      <div className="form-field">
        <label className="form-label">What is the scope of work?</label>
        <div className="checkbox-group">
          {['Flooring replacement', 'Lighting upgrade', 'Paint & trim', 'Full renovation', 'Other'].map(v => (
            <label key={v} className="checkbox-label">
              <input
                type="checkbox"
                checked={(data.renovationScope || []).includes(v)}
                onChange={() => toggleMulti('renovationScope', v)}
              />
              {v}
            </label>
          ))}
        </div>
      </div>

      <SecHead title="Timeline" />

      <div className="form-field">
        <label className="form-label">What is your timeline?</label>
        <select
          className="input"
          value={data.timeline || ''}
          onChange={e => u('timeline', e.target.value)}
        >
          <option value="">— Select —</option>
          <option value="Under 3 months">Under 3 months</option>
          <option value="3 to 6 months">3 to 6 months</option>
          <option value="6 to 12 months">6 to 12 months</option>
          <option value="No rush">No rush</option>
          <option value="Specific date">Specific target date</option>
        </select>
      </div>

      {data.timeline === 'Specific date' && (
        <div className="form-field">
          <label className="form-label">Target date</label>
          <input
            className="input"
            type="date"
            value={data.targetDate || ''}
            onChange={e => u('targetDate', e.target.value)}
          />
        </div>
      )}

      <SecHead title="Flooring & Lighting Work" />

      <div className="form-field">
        <label className="form-label">Is flooring included in this project?</label>
        <select
          className="input"
          value={data.floringIncluded ? 'Yes' : 'No'}
          onChange={e => u('floringIncluded', e.target.value === 'Yes')}
        >
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
      </div>

      <div className="form-field">
        <label className="form-label">Lighting work — who will handle?</label>
        <select
          className="input"
          value={data.lightingWork || ''}
          onChange={e => u('lightingWork', e.target.value)}
        >
          <option value="">— Select —</option>
          <option value="We will handle">We will handle</option>
          <option value="Customer will hire electrician">Customer will hire electrician</option>
          <option value="Not needed">Not needed</option>
        </select>
      </div>

      <SecHead title="Final Details" />

      <div className="form-field">
        <label className="form-label">How did you hear about us?</label>
        <select
          className="input"
          value={data.referral || ''}
          onChange={e => u('referral', e.target.value)}
        >
          <option value="">— Select —</option>
          <option value="Referral">Referral</option>
          <option value="Google">Google</option>
          <option value="Social media">Social media</option>
          <option value="Repeat customer">Repeat customer</option>
          <option value="Other">Other (please specify)</option>
        </select>
      </div>

      {data.referral === 'Referral' && (
        <div className="form-field">
          <label className="form-label">Referred by (name)</label>
          <input
            className="input"
            type="text"
            placeholder="Customer name"
            value={data.referralName || ''}
            onChange={e => u('referralName', e.target.value)}
          />
        </div>
      )}

      {data.referral === 'Other' && (
        <div className="form-field">
          <label className="form-label">How did you hear about us?</label>
          <input
            className="input"
            type="text"
            placeholder="Please describe"
            value={data.referralOther || ''}
            onChange={e => u('referralOther', e.target.value)}
          />
        </div>
      )}

      <div className="form-field">
        <label className="form-label">Special notes or concerns</label>
        <div className="checkbox-group">
          {['Pet in home', 'Access restrictions', 'Asbestos concern', 'Narrow doorways', 'HOA approval needed'].map(v => (
            <label key={v} className="checkbox-label">
              <input
                type="checkbox"
                checked={(data.specialNoteItems || []).includes(v)}
                onChange={() => toggleMulti('specialNoteItems', v)}
              />
              {v}
            </label>
          ))}
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">Additional notes</label>
        <textarea
          className="textarea"
          rows={3}
          placeholder="Any other details or concerns…"
          value={data.specialNotes || ''}
          onChange={e => u('specialNotes', e.target.value)}
        />
      </div>
    </div>
  );
}
