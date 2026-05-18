import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  Assessment, AssessmentStatus, JobType, JobInstance,
  KitchenAssessment, BathroomAssessment, FlooringAssessment, PaintingAssessment, OtherAssessment,
  LivingRoomAssessment, BedroomAssessment, DeckAssessment,
  PriceCategory, MarkupSettings, EstimateData,
} from '../types';
import { defaultPriceGuide, DEFAULT_MARKUP } from '../utils/defaultPriceGuide';
import { pushAssessment, deleteAssessmentRemote, pushTeamMembers, pushMarkupSettings, pushPriceGuide, pullAllAssessments, pullTeamMembers, pullMarkupSettings, pullPriceGuide } from '../utils/supabaseSync';

const STORAGE_KEY = 'maximus-estimus-v3';

function emptyKitchen(): KitchenAssessment {
  return {
    measurements: { walls: { A: {}, B: {}, C: {}, D: {} }, soffitSame: true },
    questions: {},
    photos: {},
  };
}

function emptyBathroom(): BathroomAssessment {
  return {
    measurements: { walls: { A: {}, B: {}, C: {}, D: {} }, soffitSame: true },
    questions: {},
    photos: {},
  };
}

function emptyFlooring(): FlooringAssessment {
  return {
    measurements: { rooms: [{ id: uuidv4(), label: 'Room 1', parts: [], transitions: [], trims: [] }] },
    questions: {},
    photos: { roomPhotos: {} },
  };
}

function emptyPainting(): PaintingAssessment {
  return {
    measurements: { floorMeasurements: [], trimMeasurements: [] },
    questions: {},
    photos: {},
  };
}

function emptyLivingRoom(): LivingRoomAssessment {
  return {
    measurements: {},
    questions: {},
    photos: {},
  };
}

function emptyBedroom(): BedroomAssessment {
  return {
    measurements: {},
    questions: {},
    photos: {},
  };
}

function emptyDeck(): DeckAssessment {
  return {
    measurements: {},
    questions: {},
    photos: {},
  };
}

function emptyOther(): OtherAssessment {
  return {};
}

export function emptyJobInstance(type: JobType, label: string): JobInstance {
  const base = { id: uuidv4(), type, label, kitchen: emptyKitchen() };
  if (type === 'Bathroom') return { ...base, bathroom: emptyBathroom() };
  if (type === 'Flooring') return { ...base, flooring: emptyFlooring() };
  if (type === 'Painting') return { ...base, painting: emptyPainting() };
  if (type === 'Living Room') return { ...base, livingRoom: emptyLivingRoom() };
  if (type === 'Bedroom') return { ...base, bedroom: emptyBedroom() };
  if (type === 'Deck') return { ...base, deck: emptyDeck() };
  if (type === 'Other') return { ...base, other: emptyOther() };
  return base;
}

export function emptyAssessment(creatorId: string = ''): Assessment {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    creatorId,
    client: {
      firstName: '', lastName: '', address: '', phone: '', email: '',
      notes: '', teamMember: '', visitDate: new Date().toISOString().split('T')[0],
    },
    jobs: [],
    costs: {
      cabinets: '', countertops: '', backsplash: '', appliances: '',
      flooring: '', demolition: '', plumbing: '', electrical: '',
      painting: '', labor: '', permits: '', other: '', notes: '',
    },
    generalNotes: '',
  };
}

interface StoredData {
  assessments: Assessment[];
  teamMembers: string[];
  priceGuide: PriceCategory[];
  markupSettings: MarkupSettings;
}

function load(): StoredData {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      assessments: raw.assessments || [],
      teamMembers: raw.teamMembers || [],
      priceGuide: raw.priceGuide || defaultPriceGuide(),
      markupSettings: raw.markupSettings || DEFAULT_MARKUP,
    };
  } catch {
    return { assessments: [], teamMembers: [], priceGuide: defaultPriceGuide(), markupSettings: DEFAULT_MARKUP };
  }
}

function save(assessments: Assessment[], teamMembers: string[], priceGuide: PriceCategory[], markupSettings: MarkupSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ assessments, teamMembers, priceGuide, markupSettings }));
}

function mergeAssessments(local: Assessment[], remote: Assessment[]): Assessment[] {
  const remoteMap = new Map(remote.map(a => [a.id, a]));

  const merged = local.map(a => {
    const r = remoteMap.get(a.id);
    if (!r) return a;
    // Last-write-wins: compare updatedAt timestamps
    return new Date(r.updatedAt) > new Date(a.updatedAt) ? r : a;
  });

  // Add any remote assessments not in local
  for (const r of remote) {
    if (!local.find(a => a.id === r.id)) {
      merged.push(r);
    }
  }

  return merged;
}

interface Store {
  assessments: Assessment[];
  teamMembers: string[];
  priceGuide: PriceCategory[];
  markupSettings: MarkupSettings;
  createAssessment: (userId?: string) => string;
  updateAssessment: (id: string, patch: Partial<Assessment>) => void;
  deleteAssessment: (id: string) => void;
  setStatus: (id: string, status: AssessmentStatus) => void;
  addJob: (assessmentId: string, type: JobType, label: string) => void;
  removeJob: (assessmentId: string, jobId: string) => void;
  updateJobKitchen: (assessmentId: string, jobId: string, kitchen: KitchenAssessment) => void;
  updateJobBathroom: (assessmentId: string, jobId: string, bathroom: BathroomAssessment) => void;
  updateJobFlooring: (assessmentId: string, jobId: string, flooring: FlooringAssessment) => void;
  updateJobPainting: (assessmentId: string, jobId: string, painting: PaintingAssessment) => void;
  updateJobLivingRoom: (assessmentId: string, jobId: string, livingRoom: LivingRoomAssessment) => void;
  updateJobBedroom: (assessmentId: string, jobId: string, bedroom: BedroomAssessment) => void;
  updateJobDeck: (assessmentId: string, jobId: string, deck: DeckAssessment) => void;
  updateJobOther: (assessmentId: string, jobId: string, other: OtherAssessment) => void;
  addTeamMember: (name: string) => void;
  removeTeamMember: (name: string) => void;
  getAssessment: (id: string) => Assessment | undefined;
  updatePriceGuide: (guide: PriceCategory[]) => void;
  resetPriceGuide: () => void;
  updateMarkupSettings: (settings: MarkupSettings) => void;
  updateEstimate: (assessmentId: string, estimate: EstimateData) => void;
  syncFromCloud: () => Promise<void>;
}

const stored = load();

export const useAssessmentStore = create<Store>((set, get) => ({
  assessments: stored.assessments,
  teamMembers: stored.teamMembers,
  priceGuide: stored.priceGuide,
  markupSettings: stored.markupSettings,

  createAssessment: (userId = '') => {
    const a = emptyAssessment(userId);
    set(s => {
      const next = [a, ...s.assessments];
      save(next, s.teamMembers, s.priceGuide, s.markupSettings);
      return { assessments: next };
    });
    pushAssessment(a).catch(console.error);
    return a.id;
  },

  updateAssessment: (id, patch) => {
    set(s => {
      const next = s.assessments.map(a =>
        a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a
      );
      save(next, s.teamMembers, s.priceGuide, s.markupSettings);
      const updated = next.find(a => a.id === id);
      if (updated) {
        pushAssessment(updated).catch(console.error);
      }
      return { assessments: next };
    });
  },

  deleteAssessment: (id) => {
    set(s => {
      const next = s.assessments.filter(a => a.id !== id);
      save(next, s.teamMembers, s.priceGuide, s.markupSettings);
      deleteAssessmentRemote(id).catch(console.error);
      return { assessments: next };
    });
  },

  setStatus: (id, status) => get().updateAssessment(id, { status }),

  addJob: (assessmentId, type, label) => {
    set(s => {
      const next = s.assessments.map(a => {
        if (a.id !== assessmentId) return a;
        return { ...a, jobs: [...a.jobs, emptyJobInstance(type, label)], updatedAt: new Date().toISOString() };
      });
      save(next, s.teamMembers, s.priceGuide, s.markupSettings);
      const updated = next.find(a => a.id === assessmentId);
      if (updated) pushAssessment(updated).catch(console.error);
      return { assessments: next };
    });
  },

  removeJob: (assessmentId, jobId) => {
    set(s => {
      const next = s.assessments.map(a => {
        if (a.id !== assessmentId) return a;
        return { ...a, jobs: a.jobs.filter(j => j.id !== jobId), updatedAt: new Date().toISOString() };
      });
      save(next, s.teamMembers, s.priceGuide, s.markupSettings);
      const updated = next.find(a => a.id === assessmentId);
      if (updated) pushAssessment(updated).catch(console.error);
      return { assessments: next };
    });
  },

  updateJobKitchen: (assessmentId, jobId, kitchen) => {
    set(s => {
      const next = s.assessments.map(a => {
        if (a.id !== assessmentId) return a;
        return { ...a, jobs: a.jobs.map(j => j.id === jobId ? { ...j, kitchen } : j), updatedAt: new Date().toISOString() };
      });
      save(next, s.teamMembers, s.priceGuide, s.markupSettings);
      const updated = next.find(a => a.id === assessmentId);
      if (updated) pushAssessment(updated).catch(console.error);
      return { assessments: next };
    });
  },

  updateJobBathroom: (assessmentId, jobId, bathroom) => {
    set(s => {
      const next = s.assessments.map(a => {
        if (a.id !== assessmentId) return a;
        return { ...a, jobs: a.jobs.map(j => j.id === jobId ? { ...j, bathroom } : j), updatedAt: new Date().toISOString() };
      });
      save(next, s.teamMembers, s.priceGuide, s.markupSettings);
      const updated = next.find(a => a.id === assessmentId);
      if (updated) pushAssessment(updated).catch(console.error);
      return { assessments: next };
    });
  },

  updateJobFlooring: (assessmentId, jobId, flooring) => {
    set(s => {
      const next = s.assessments.map(a => {
        if (a.id !== assessmentId) return a;
        return { ...a, jobs: a.jobs.map(j => j.id === jobId ? { ...j, flooring } : j), updatedAt: new Date().toISOString() };
      });
      save(next, s.teamMembers, s.priceGuide, s.markupSettings);
      const updated = next.find(a => a.id === assessmentId);
      if (updated) pushAssessment(updated).catch(console.error);
      return { assessments: next };
    });
  },

  updateJobPainting: (assessmentId, jobId, painting) => {
    set(s => {
      const next = s.assessments.map(a => {
        if (a.id !== assessmentId) return a;
        return { ...a, jobs: a.jobs.map(j => j.id === jobId ? { ...j, painting } : j), updatedAt: new Date().toISOString() };
      });
      save(next, s.teamMembers, s.priceGuide, s.markupSettings);
      const updated = next.find(a => a.id === assessmentId);
      if (updated) pushAssessment(updated).catch(console.error);
      return { assessments: next };
    });
  },

  updateJobLivingRoom: (assessmentId, jobId, livingRoom) => {
    set(s => {
      const next = s.assessments.map(a => {
        if (a.id !== assessmentId) return a;
        return { ...a, jobs: a.jobs.map(j => j.id === jobId ? { ...j, livingRoom } : j), updatedAt: new Date().toISOString() };
      });
      save(next, s.teamMembers, s.priceGuide, s.markupSettings);
      const updated = next.find(a => a.id === assessmentId);
      if (updated) pushAssessment(updated).catch(console.error);
      return { assessments: next };
    });
  },

  updateJobBedroom: (assessmentId, jobId, bedroom) => {
    set(s => {
      const next = s.assessments.map(a => {
        if (a.id !== assessmentId) return a;
        return { ...a, jobs: a.jobs.map(j => j.id === jobId ? { ...j, bedroom } : j), updatedAt: new Date().toISOString() };
      });
      save(next, s.teamMembers, s.priceGuide, s.markupSettings);
      const updated = next.find(a => a.id === assessmentId);
      if (updated) pushAssessment(updated).catch(console.error);
      return { assessments: next };
    });
  },

  updateJobDeck: (assessmentId, jobId, deck) => {
    set(s => {
      const next = s.assessments.map(a => {
        if (a.id !== assessmentId) return a;
        return { ...a, jobs: a.jobs.map(j => j.id === jobId ? { ...j, deck } : j), updatedAt: new Date().toISOString() };
      });
      save(next, s.teamMembers, s.priceGuide, s.markupSettings);
      const updated = next.find(a => a.id === assessmentId);
      if (updated) pushAssessment(updated).catch(console.error);
      return { assessments: next };
    });
  },

  updateJobOther: (assessmentId, jobId, other) => {
    set(s => {
      const next = s.assessments.map(a => {
        if (a.id !== assessmentId) return a;
        return { ...a, jobs: a.jobs.map(j => j.id === jobId ? { ...j, other } : j), updatedAt: new Date().toISOString() };
      });
      save(next, s.teamMembers, s.priceGuide, s.markupSettings);
      const updated = next.find(a => a.id === assessmentId);
      if (updated) pushAssessment(updated).catch(console.error);
      return { assessments: next };
    });
  },

  addTeamMember: (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    set(s => {
      if (s.teamMembers.includes(trimmed)) return s;
      const next = [...s.teamMembers, trimmed];
      save(s.assessments, next, s.priceGuide, s.markupSettings);
      pushTeamMembers(next).catch(console.error);
      return { teamMembers: next };
    });
  },

  removeTeamMember: (name) => {
    set(s => {
      const next = s.teamMembers.filter(m => m !== name);
      save(s.assessments, next, s.priceGuide, s.markupSettings);
      pushTeamMembers(next).catch(console.error);
      return { teamMembers: next };
    });
  },

  getAssessment: (id) => get().assessments.find(a => a.id === id),

  updatePriceGuide: (guide) => {
    set(s => {
      save(s.assessments, s.teamMembers, guide, s.markupSettings);
      pushPriceGuide(guide).catch(console.error);
      return { priceGuide: guide };
    });
  },

  resetPriceGuide: () => {
    const guide = defaultPriceGuide();
    set(s => {
      save(s.assessments, s.teamMembers, guide, s.markupSettings);
      pushPriceGuide(guide).catch(console.error);
      return { priceGuide: guide };
    });
  },

  updateMarkupSettings: (settings) => {
    set(s => {
      save(s.assessments, s.teamMembers, s.priceGuide, settings);
      pushMarkupSettings(settings).catch(console.error);
      return { markupSettings: settings };
    });
  },

  updateEstimate: (assessmentId, estimate) => {
    set(s => {
      const next = s.assessments.map(a =>
        a.id === assessmentId ? { ...a, estimate, updatedAt: new Date().toISOString() } : a
      );
      save(next, s.teamMembers, s.priceGuide, s.markupSettings);
      const updated = next.find(a => a.id === assessmentId);
      if (updated) pushAssessment(updated).catch(console.error);
      return { assessments: next };
    });
  },

  syncFromCloud: async () => {
    try {
      const [assessments, teamMembers, markupSettings, priceGuide] = await Promise.all([
        pullAllAssessments(),
        pullTeamMembers(),
        pullMarkupSettings(),
        pullPriceGuide(),
      ]);

      set(s => {
        // When online, Supabase is the source of truth — use it directly, don't merge with stale local data
        const newState = {
          assessments: assessments,
          teamMembers: teamMembers || s.teamMembers,
          markupSettings: markupSettings || s.markupSettings,
          priceGuide: priceGuide || s.priceGuide,
        };
        save(newState.assessments, newState.teamMembers, newState.priceGuide, newState.markupSettings);
        return newState;
      });
    } catch (err) {
      console.error('Failed to sync from cloud:', err);
    }
  },
}));
