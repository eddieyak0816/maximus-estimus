import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAssessmentStore } from '../store/assessmentStore';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
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
import LayoutTab from '../components/LayoutTab';
import WallMeasurementDialog from '../components/WallMeasurementDialog';
import { formatDate } from '../utils/calculations';
import { hasQuestionsContent } from '../utils/hasQuestionsContent';
import type {
  AssessmentStatus, KitchenAssessment, BathroomAssessment,
  FlooringAssessment, LivingRoomAssessment, BedroomAssessment, DeckAssessment, OtherAssessment,
  LayoutData, WallData,
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
  { id: 'layout',       label: '📐 Layout' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AssessmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getAssessment, setStatus, updateAssessment,
    updateJobKitchen, updateJobBathroom, updateJobFlooring, updateJobLivingRoom, updateJobBedroom, updateJobDeck, updateJobOther,
    updateJobLayout,
  } = useAssessmentStore();

  const assessment = id ? getAssessment(id) : undefined;
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('measurements');
  const [users, setUsers] = useState<Array<{ id: string; firstName: string; lastName: string }>>([]);
  const [showReassignDropdown, setShowReassignDropdown] = useState(false);
  const [wallDialog, setWallDialog] = useState<{ show: boolean; wallIndex: number; direction: 'horizontal' | 'vertical' | 'diagonal' | null }>({ show: false, wallIndex: 0, direction: null });

  // Load users for reassignment (admin only)
  useEffect(() => {
    if (!user?.isAdmin) return;
    async function loadUsers() {
      const { data, error } = await supabase
        .from('pin_users')
        .select('id,first_name,last_name');
      if (!error && data) {
        setUsers(data.map(u => ({ id: u.id, firstName: u.first_name, lastName: u.last_name })));
      }
    }
    loadUsers();
  }, [user?.isAdmin]);

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
        updateKitchen({
          ...activeJob.kitchen,
          photos: {
            ...activeJob.kitchen.photos,
            photos: [...(activeJob.kitchen.photos?.photos || []), { id: uuidv4(), label: wallName, photoId }],
          },
        });
      } else if (activeJob.type === 'Bathroom' && activeJob.bathroom) {
        updateBathroom({
          ...activeJob.bathroom,
          photos: {
            ...activeJob.bathroom.photos,
            photos: [...(activeJob.bathroom.photos?.photos || []), { id: uuidv4(), label: wallName, photoId }],
          },
        });
      } else if (activeJob.type === 'Flooring' && activeJob.flooring) {
        updateFlooring({
          ...activeJob.flooring,
          photos: {
            ...activeJob.flooring.photos,
            photos: [...(activeJob.flooring.photos?.photos || []), { id: uuidv4(), label: wallName, photoId }],
          },
        });
      } else if (activeJob.type === 'Living Room' && activeJob.livingRoom) {
        updateLivingRoom({
          ...activeJob.livingRoom,
          photos: {
            ...activeJob.livingRoom.photos,
            photos: [...(activeJob.livingRoom.photos?.photos || []), { id: uuidv4(), label: wallName, photoId }],
          },
        });
      } else if (activeJob.type === 'Bedroom' && activeJob.bedroom) {
        updateBedroom({
          ...activeJob.bedroom,
          photos: {
            ...activeJob.bedroom.photos,
            photos: [...(activeJob.bedroom.photos?.photos || []), { id: uuidv4(), label: wallName, photoId }],
          },
        });
      } else if (activeJob.type === 'Deck' && activeJob.deck) {
        updateDeck({
          ...activeJob.deck,
          photos: {
            ...activeJob.deck.photos,
            photos: [...(activeJob.deck.photos?.photos || []), { id: uuidv4(), label: wallName, photoId }],
          },
        });
      }
    } catch (err) {
      console.error('Failed to capture wall photo:', err);
      alert('Failed to save wall photo');
    }
  };

  const questionsHaveContent = () => {
    if (!activeJob) return false;

    if (activeJob.type === 'Kitchen' && activeJob.kitchen) {
      return hasQuestionsContent(activeJob.kitchen.questions);
    } else if (activeJob.type === 'Bathroom' && activeJob.bathroom) {
      return hasQuestionsContent(activeJob.bathroom.questions);
    } else if (activeJob.type === 'Flooring' && activeJob.flooring) {
      return hasQuestionsContent(activeJob.flooring.questions);
    } else if (activeJob.type === 'Painting' && activeJob.painting) {
      return hasQuestionsContent(activeJob.painting.questions);
    } else if (activeJob.type === 'Living Room' && activeJob.livingRoom) {
      return hasQuestionsContent(activeJob.livingRoom.questions);
    } else if (activeJob.type === 'Bedroom' && activeJob.bedroom) {
      return hasQuestionsContent(activeJob.bedroom.questions);
    } else if (activeJob.type === 'Deck' && activeJob.deck) {
      return hasQuestionsContent(activeJob.deck.questions);
    }
    return false;
  };

  const handleLayoutUpdate = useCallback((layout: LayoutData) => {
    if (!activeJob) return;
    updateJobLayout(id!, activeJob.id, layout);
  }, [id, activeJob]);

  const handleWallPlaced = (_x: number, _y: number, direction: 'horizontal' | 'vertical' | 'diagonal' | null) => {
    console.log('🎯 handleWallPlaced called:', { direction, activeJobType: activeJob?.type });
    if (!direction) return;
    // Find next available wall index (A=0, B=1, C=2, D=3, E=4, etc.)
    let wallIndex = 0;
    if (activeJob?.type === 'Kitchen' && activeJob.kitchen) {
      wallIndex = activeJob.kitchen.measurements.walls.length;
    } else if (activeJob?.type === 'Bathroom' && activeJob.bathroom) {
      wallIndex = activeJob.bathroom.measurements.walls.length;
    }
    console.log('🎯 Setting wallDialog state:', { show: true, wallIndex, direction });
    setWallDialog({ show: true, wallIndex, direction });
  };

  const handleWallMeasurementSave = (length: string) => {
    if (!activeJob || !id) return;

    const wallIndex = wallDialog.wallIndex;
    const wall: WallData = { length };

    if (activeJob.type === 'Kitchen' && activeJob.kitchen) {
      const walls = [...activeJob.kitchen.measurements.walls];
      while (walls.length <= wallIndex) walls.push({});
      walls[wallIndex] = { ...walls[wallIndex], ...wall };
      updateJobKitchen(id, activeJob.id, { ...activeJob.kitchen, measurements: { ...activeJob.kitchen.measurements, walls } });
    } else if (activeJob.type === 'Bathroom' && activeJob.bathroom) {
      const walls = [...activeJob.bathroom.measurements.walls];
      while (walls.length <= wallIndex) walls.push({});
      walls[wallIndex] = { ...walls[wallIndex], ...wall };
      updateJobBathroom(id, activeJob.id, { ...activeJob.bathroom, measurements: { ...activeJob.bathroom.measurements, walls } });
    }

    setWallDialog({ show: false, wallIndex: 0, direction: null });
  };

  const renderTabContent = () => {
    if (!activeJob) return null;

    const measurementsKey = activeTab === 'measurements' ? 'measurements-tab' : undefined;
    const startClosed = activeTab === 'measurements';

    if (activeJob.type === 'Bathroom') {
      const bath = activeJob.bathroom!;
      if (activeTab === 'measurements') {
        return <BathroomMeasurements key={measurementsKey} data={bath.measurements}
          onUpdate={m => updateBathroom({ ...bath, measurements: m })}
          onWallPhotoCapture={handleWallPhotoCapture}
          startClosed={startClosed} />;
      }
      if (activeTab === 'questions') {
        return <BathroomQuestions data={bath.questions}
          onUpdate={q => updateBathroom({ ...bath, questions: q })} />;
      }
      if (activeTab === 'layout') {
        return <LayoutTab data={activeJob.layout || {}} onUpdate={handleLayoutUpdate} onWallPlaced={handleWallPlaced} />;
      }
      return <BathroomPhotos data={bath.photos}
        measurements={bath.measurements}
        assessmentId={id!} jobId={activeJob.id}
        onUpdate={p => updateBathroom({ ...bath, photos: p })} />;
    }

    if (activeJob.type === 'Flooring') {
      const floor = activeJob.flooring!;
      if (activeTab === 'measurements') {
        return <FlooringMeasurements key={measurementsKey} data={floor.measurements}
          onUpdate={m => updateFlooring({ ...floor, measurements: m })}
          onWallPhotoCapture={handleWallPhotoCapture} />;
      }
      if (activeTab === 'questions') {
        return <FlooringQuestions data={floor.questions}
          onUpdate={q => updateFlooring({ ...floor, questions: q })} />;
      }
      if (activeTab === 'layout') {
        return <LayoutTab data={activeJob.layout || {}} onUpdate={handleLayoutUpdate} onWallPlaced={handleWallPlaced} />;
      }
      return <FlooringPhotos data={floor.photos}
        measurements={floor.measurements}
        assessmentId={id!} jobId={activeJob.id}
        onUpdate={p => updateFlooring({ ...floor, photos: p })} />;
    }

    if (activeJob.type === 'Living Room') {
      const lr = activeJob.livingRoom!;
      if (activeTab === 'measurements') {
        return <LivingRoomMeasurements key={measurementsKey} data={lr.measurements}
          onUpdate={m => updateLivingRoom({ ...lr, measurements: m })}
          onWallPhotoCapture={handleWallPhotoCapture} />;
      }
      if (activeTab === 'questions') {
        return <LivingRoomQuestions data={lr.questions}
          onUpdate={q => updateLivingRoom({ ...lr, questions: q })} />;
      }
      if (activeTab === 'layout') {
        return <LayoutTab data={activeJob.layout || {}} onUpdate={handleLayoutUpdate} onWallPlaced={handleWallPlaced} />;
      }
      return <LivingRoomPhotos data={lr.photos}
        measurements={lr.measurements}
        assessmentId={id!} jobId={activeJob.id}
        onUpdate={p => updateLivingRoom({ ...lr, photos: p })} />;
    }

    if (activeJob.type === 'Bedroom') {
      const br = activeJob.bedroom!;
      if (activeTab === 'measurements') {
        return <BedroomMeasurements key={measurementsKey} data={br.measurements}
          onUpdate={m => updateBedroom({ ...br, measurements: m })}
          onWallPhotoCapture={handleWallPhotoCapture} />;
      }
      if (activeTab === 'questions') {
        return <BedroomQuestions data={br.questions}
          onUpdate={q => updateBedroom({ ...br, questions: q })} />;
      }
      if (activeTab === 'layout') {
        return <LayoutTab data={activeJob.layout || {}} onUpdate={handleLayoutUpdate} onWallPlaced={handleWallPlaced} />;
      }
      return <BedroomPhotos data={br.photos}
        measurements={br.measurements}
        assessmentId={id!} jobId={activeJob.id}
        onUpdate={p => updateBedroom({ ...br, photos: p })} />;
    }

    if (activeJob.type === 'Deck') {
      const dk = activeJob.deck!;
      if (activeTab === 'measurements') {
        return <DeckMeasurements key={measurementsKey} data={dk.measurements}
          onUpdate={m => updateDeck({ ...dk, measurements: m })}
          onWallPhotoCapture={handleWallPhotoCapture} />;
      }
      if (activeTab === 'questions') {
        return <DeckQuestions data={dk.questions}
          onUpdate={q => updateDeck({ ...dk, questions: q })} />;
      }
      if (activeTab === 'layout') {
        return <LayoutTab data={activeJob.layout || {}} onUpdate={handleLayoutUpdate} onWallPlaced={handleWallPlaced} />;
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
      return <KitchenMeasurements key={measurementsKey} data={activeJob.kitchen.measurements}
        onUpdate={m => updateKitchen({ ...activeJob.kitchen, measurements: m })}
        onWallPhotoCapture={handleWallPhotoCapture}
        startClosed={startClosed} />;
    }
    if (activeTab === 'questions') {
      return <KitchenQuestions data={activeJob.kitchen.questions}
        onUpdate={q => updateKitchen({ ...activeJob.kitchen, questions: q })} />;
    }
    if (activeTab === 'layout') {
      return <LayoutTab data={activeJob.layout || {}} onUpdate={handleLayoutUpdate} onWallPlaced={handleWallPlaced} />;
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
          {user?.isAdmin && (
            <div style={{ position: 'relative' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowReassignDropdown(!showReassignDropdown)}>
                {assessment.assignedToUserId
                  ? `Assigned: ${users.find(u => u.id === assessment.assignedToUserId)?.firstName || 'User'}`
                  : 'Assign'}
              </button>
              {showReassignDropdown && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 4,
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                  borderRadius: 6, zIndex: 1000, minWidth: 180,
                }}>
                  <div style={{ padding: 8 }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', marginBottom: 4 }}
                      onClick={() => {
                        updateAssessment(id!, { assignedToUserId: undefined });
                        setShowReassignDropdown(false);
                      }}
                    >
                      Unassigned
                    </button>
                    {users.map(u => (
                      <button
                        key={u.id}
                        className="btn btn-ghost btn-sm"
                        style={{ width: '100%', justifyContent: 'flex-start', marginBottom: 4 }}
                        onClick={() => {
                          updateAssessment(id!, { assignedToUserId: u.id });
                          setShowReassignDropdown(false);
                        }}
                      >
                        {u.firstName} {u.lastName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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
                className={`tab-btn${activeTab === t.id ? ' active' : ''}${t.id === 'questions' && questionsHaveContent() ? ' has-content' : ''}`}
                onClick={() => setActiveTab(t.id)}
                title={t.id === 'questions' && questionsHaveContent() ? 'This tab has content' : ''}
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

      {wallDialog.show && wallDialog.direction && (
        <WallMeasurementDialog
          wallDirection={wallDialog.direction}
          wallLabel={String.fromCharCode(65 + wallDialog.wallIndex)}
          onSave={handleWallMeasurementSave}
          onCancel={() => setWallDialog({ show: false, wallIndex: 0, direction: null })}
        />
      )}
    </div>
  );
}
