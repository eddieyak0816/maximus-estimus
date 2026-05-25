import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAssessmentStore } from '../store/assessmentStore';
import { savePhoto } from '../utils/photoStorage';
import StatusBadge from '../components/StatusBadge';
import KitchenMeasurements from './kitchen/KitchenMeasurements';
import KitchenQuestions from './kitchen/KitchenQuestions';
import KitchenPhotos from './kitchen/KitchenPhotos';
import BathroomMeasurements from './bathroom/BathroomMeasurements';
import BathroomQuestions from './bathroom/BathroomQuestions';
import BathroomPhotos from './bathroom/BathroomPhotos';
import FlooringMeasurements from './flooring/FlooringMeasurements';
import FlooringQuestions from './flooring/FlooringQuestions';
import FlooringPhotos from './flooring/FlooringPhotos';
import LivingRoomMeasurements from './living-room/LivingRoomMeasurements';
import LivingRoomQuestions from './living-room/LivingRoomQuestions';
import LivingRoomPhotos from './living-room/LivingRoomPhotos';
import BedroomMeasurements from './bedroom/BedroomMeasurements';
import BedroomQuestions from './bedroom/BedroomQuestions';
import BedroomPhotos from './bedroom/BedroomPhotos';
import DeckMeasurements from './deck/DeckMeasurements';
import DeckQuestions from './deck/DeckQuestions';
import DeckPhotos from './deck/DeckPhotos';
import OtherTabs from './other/OtherTabs';
import { formatDate } from '../utils/calculations';
import type {
  AssessmentStatus, KitchenAssessment, BathroomAssessment,
  FlooringAssessment, LivingRoomAssessment, BedroomAssessment, DeckAssessment, OtherAssessment,
} from '../types';

const STATUS_OPTIONS: AssessmentStatus[] = ['draft', 'in-progress', 'complete'];
const STATUS_LABELS: Record<AssessmentStatus, string> = {
  draft: 'Draft',
  'in-progress': 'In Progress',
  complete: 'Complete',
};

const TABS = [
  { id: 'measurements', label: '📏 Measure' },
  { id: 'questions',    label: '📋 Questions' },
  { id: 'photos',       label: '📷 Photos' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AssessmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getAssessment, setStatus,
    updateJobKitchen, updateJobBathroom, updateJobFlooring, updateJobLivingRoom, updateJobBedroom, updateJobDeck, updateJobOther,
  } = useAssessmentStore();

  const assessment = id ? getAssessment(id) : undefined;
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('measurements');

  if (!assessment) {
    return (
      <div className="page">
        <div className="empty-state">
          <h2>Assessment not found</h2>
          <Link to="/" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const { client, jobs } = assessment;
  const clientName = [client.firstName, client.lastName].filter(Boolean).join(' ') || 'Untitled';
  const activeJob = jobs.find(j => j.id === activeJobId) ?? jobs[0] ?? null;

  const updateKitchen = (kitchen: KitchenAssessment) => {
    if (!activeJob) return;
    updateJobKitchen(id!, activeJob.id, kitchen);
  };

  const updateBathroom = (bathroom: BathroomAssessment) => {
    if (!activeJob) return;
    updateJobBathroom(id!, activeJob.id, bathroom);
  };

  const updateFlooring = (flooring: FlooringAssessment) => {
    if (!activeJob) return;
    updateJobFlooring(id!, activeJob.id, flooring);
  };

  const updateLivingRoom = (livingRoom: LivingRoomAssessment) => {
    if (!activeJob) return;
    updateJobLivingRoom(id!, activeJob.id, livingRoom);
  };

  const updateBedroom = (bedroom: BedroomAssessment) => {
    if (!activeJob) return;
    updateJobBedroom(id!, activeJob.id, bedroom);
  };

  const updateDeck = (deck: DeckAssessment) => {
    if (!activeJob) return;
    updateJobDeck(id!, activeJob.id, deck);
  };

  const updateOther = (other: OtherAssessment) => {
    if (!activeJob) return;
    updateJobOther(id!, activeJob.id, other);
  };

  const handleWallPhotoCapture = async (wallName: string, blob: Blob) => {
    if (!activeJob) return;
    try {
      const photoId = await savePhoto(id!, activeJob.id, `photo-${uuidv4()}`, blob);
      if (activeJob.type === 'Kitchen') {
        const kitchen = activeJob.kitchen;
        updateKitchen({
          ...kitchen,
          photos: {
            ...kitchen.photos,
            photos: [...(kitchen.photos?.photos || []), { id: uuidv4(), label: wallName, photoId }],
          },
        });
      } else if (activeJob.type === 'Bathroom') {
        const bathroom = activeJob.bathroom;
        updateBathroom({
          ...bathroom,
          photos: {
            ...bathroom.photos,
            photos: [...(bathroom.photos?.photos || []), { id: uuidv4(), label: wallName, photoId }],
          },
        });
      } else if (activeJob.type === 'Flooring') {
        const flooring = activeJob.flooring;
        updateFlooring({
          ...flooring,
          photos: {
            ...flooring.photos,
            photos: [...(flooring.photos?.photos || []), { id: uuidv4(), label: wallName, photoId }],
          },
        });
      } else if (activeJob.type === 'Living Room') {
        const livingRoom = activeJob.livingRoom;
        updateLivingRoom({
          ...livingRoom,
          photos: {
            ...livingRoom.photos,
            photos: [...(livingRoom.photos?.photos || []), { id: uuidv4(), label: wallName, photoId }],
          },
        });
      } else if (activeJob.type === 'Bedroom') {
        const bedroom = activeJob.bedroom;
        updateBedroom({
          ...bedroom,
          photos: {
            ...bedroom.photos,
            photos: [...(bedroom.photos?.photos || []), { id: uuidv4(), label: wallName, photoId }],
          },
        });
      } else if (activeJob.type === 'Deck') {
        const deck = activeJob.deck;
        updateDeck({
          ...deck,
          photos: {
            ...deck.photos,
            photos: [...(deck.photos?.photos || []), { id: uuidv4(), label: wallName, photoId }],
          },
        });
      }
    } catch (err) {
      console.error('Failed to capture wall photo:', err);
      alert('Failed to save wall photo');
    }
  };

  const renderTabContent = () => {
    if (!activeJob) return null;

    if (activeJob.type === 'Bathroom') {
      const bath = activeJob.bathroom!;
      if (activeTab === 'measurements') {
        return <BathroomMeasurements data={bath.measurements}
          onUpdate={m => updateBathroom({ ...bath, measurements: m })}
          onWallPhotoCapture={handleWallPhotoCapture} />;
      }
      if (activeTab === 'questions') {
        return <BathroomQuestions data={bath.questions}
          onUpdate={q => updateBathroom({ ...bath, questions: q })} />;
      }
      return <BathroomPhotos data={bath.photos}
        measurements={bath.measurements}
        assessmentId={id!} jobId={activeJob.id}
        onUpdate={p => updateBathroom({ ...bath, photos: p })} />;
    }

    if (activeJob.type === 'Flooring') {
      const floor = activeJob.flooring!;
      if (activeTab === 'measurements') {
        return <FlooringMeasurements data={floor.measurements}
          onUpdate={m => updateFlooring({ ...floor, measurements: m })}
          onWallPhotoCapture={handleWallPhotoCapture} />;
      }
      if (activeTab === 'questions') {
        return <FlooringQuestions data={floor.questions}
          onUpdate={q => updateFlooring({ ...floor, questions: q })} />;
      }
      return <FlooringPhotos data={floor.photos}
        measurements={floor.measurements}
        assessmentId={id!} jobId={activeJob.id}
        onUpdate={p => updateFlooring({ ...floor, photos: p })} />;
    }

    if (activeJob.type === 'Living Room') {
      const lr = activeJob.livingRoom!;
      if (activeTab === 'measurements') {
        return <LivingRoomMeasurements data={lr.measurements}
          onUpdate={m => updateLivingRoom({ ...lr, measurements: m })}
          onWallPhotoCapture={handleWallPhotoCapture} />;
      }
      if (activeTab === 'questions') {
        return <LivingRoomQuestions data={lr.questions}
          onUpdate={q => updateLivingRoom({ ...lr, questions: q })} />;
      }
      return <LivingRoomPhotos data={lr.photos}
        measurements={lr.measurements}
        assessmentId={id!} jobId={activeJob.id}
        onUpdate={p => updateLivingRoom({ ...lr, photos: p })} />;
    }

    if (activeJob.type === 'Bedroom') {
      const br = activeJob.bedroom!;
      if (activeTab === 'measurements') {
        return <BedroomMeasurements data={br.measurements}
          onUpdate={m => updateBedroom({ ...br, measurements: m })}
          onWallPhotoCapture={handleWallPhotoCapture} />;
      }
      if (activeTab === 'questions') {
        return <BedroomQuestions data={br.questions}
          onUpdate={q => updateBedroom({ ...br, questions: q })} />;
      }
      return <BedroomPhotos data={br.photos}
        measurements={br.measurements}
        assessmentId={id!} jobId={activeJob.id}
        onUpdate={p => updateBedroom({ ...br, photos: p })} />;
    }

    if (activeJob.type === 'Deck') {
      const dk = activeJob.deck!;
      if (activeTab === 'measurements') {
        return <DeckMeasurements data={dk.measurements}
          onUpdate={m => updateDeck({ ...dk, measurements: m })}
          onWallPhotoCapture={handleWallPhotoCapture} />;
      }
      if (activeTab === 'questions') {
        return <DeckQuestions data={dk.questions}
          onUpdate={q => updateDeck({ ...dk, questions: q })} />;
      }
      return <DeckPhotos data={dk.photos}
        measurements={dk.measurements}
        assessmentId={id!} jobId={activeJob.id}
        onUpdate={p => updateDeck({ ...dk, photos: p })} />;
    }

    if (activeJob.type === 'Other') {
      const other = activeJob.other!;
      return <OtherTabs data={other} activeTab={activeTab}
        onUpdate={updateOther} />;
    }

    // Kitchen (default)
    if (activeTab === 'measurements') {
      return <KitchenMeasurements data={activeJob.kitchen.measurements}
        onUpdate={m => updateKitchen({ ...activeJob.kitchen, measurements: m })}
        onWallPhotoCapture={handleWallPhotoCapture} />;
    }
    if (activeTab === 'questions') {
      return <KitchenQuestions data={activeJob.kitchen.questions}
        onUpdate={q => updateKitchen({ ...activeJob.kitchen, questions: q })} />;
    }
    return <KitchenPhotos data={activeJob.kitchen.photos} measurements={activeJob.kitchen.measurements}
      assessmentId={id!} jobId={activeJob.id}
      onUpdate={p => updateKitchen({ ...activeJob.kitchen, photos: p })} />;
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="breadcrumb-row">
          <Link to="/" className="breadcrumb-link">Dashboard</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{clientName}</span>
        </div>
        <div className="detail-header-meta">
          <div className="detail-title-row">
            <h1 className="page-title">{clientName}</h1>
            <StatusBadge status={assessment.status} />
          </div>
          <p className="page-subtitle">
            {client.address && <span>{client.address} · </span>}
            <span>Updated {formatDate(assessment.updatedAt)}</span>
          </p>
        </div>
        <div className="detail-header-actions">
          <select className="select select-sm" value={assessment.status}
            onChange={e => setStatus(assessment.id, e.target.value as AssessmentStatus)}>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/assessment/${id}/client`)}>
            Edit Info
          </button>
        </div>
      </div>

      {/* No jobs yet */}
      {jobs.length === 0 && (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <div className="empty-icon">📋</div>
          <h2>No jobs added yet</h2>
          <p>Go back to add the spaces you'll be assessing.</p>
          <button className="btn btn-primary" onClick={() => navigate(`/assessment/${id}/type`)}>
            Add Jobs →
          </button>
        </div>
      )}

      {/* Job switcher — only shown when there are multiple jobs */}
      {jobs.length > 1 && (
        <div className="job-switcher">
          {jobs.map(job => (
            <button
              key={job.id}
              className={`job-switcher-btn${(activeJob?.id === job.id) ? ' active' : ''}`}
              onClick={() => setActiveJobId(job.id)}
            >
              {job.label}
            </button>
          ))}
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}
            onClick={() => navigate(`/assessment/${id}/type`)}>
            + Edit Jobs
          </button>
        </div>
      )}

      {/* Active job content */}
      {activeJob && (
        <>
          {jobs.length === 1 && (
            <div className="single-job-header">
              <span className="single-job-label">{activeJob.label}</span>
              <button className="btn btn-ghost btn-sm"
                onClick={() => navigate(`/assessment/${id}/type`)}>
                + Edit Jobs
              </button>
            </div>
          )}

          <div className="tab-bar">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`tab-btn${activeTab === t.id ? ' active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {renderTabContent()}
          </div>
        </>
      )}

      {jobs.length > 0 && (
        <div className="page-footer" style={{ marginTop: 12, display: 'flex', gap: 12 }}>
          <button
            className="btn btn-outline"
            style={{ flex: 1 }}
            onClick={() => setStatus(id!, 'complete')}
            disabled={assessment.status === 'complete'}
          >
            {assessment.status === 'complete' ? '✓ Complete' : 'Mark Complete'}
          </button>
          <button
            className="btn btn-outline"
            style={{ flex: 1 }}
            onClick={() => navigate(`/assessment/${id}/summary`)}
          >
            📋 View Summary
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 2 }}
            onClick={() => navigate(`/assessment/${id}/estimate`)}
          >
            💰 View / Generate Estimate
          </button>
        </div>
      )}
    </div>
  );
}
