import type { KitchenAssessment, BathroomAssessment, FlooringAssessment } from '../types';
import type { ParsedResult } from '../components/DictationTranscriptsPanel';

type JobData = KitchenAssessment | BathroomAssessment | FlooringAssessment | any;

/**
 * Apply parsed transcript data to job measurements and questions
 * Intelligently maps parsed field names to actual form field names
 */
export function applyParsedDataToJob(
  job: JobData,
  parsed: ParsedResult
): JobData {
  if (!job) return job;

  const updated = { ...job };

  // Apply measurements
  if (parsed.measurements && typeof parsed.measurements === 'object') {
    updated.measurements = applyMeasurements(updated.measurements || {}, parsed.measurements);
  }

  // Apply questions
  if (parsed.questions && typeof parsed.questions === 'object') {
    updated.questions = applyQuestions(updated.questions || {}, parsed.questions);
  }

  // Apply notes if they exist
  if (parsed.notes) {
    // Store notes in a special field that can be reviewed
    updated._parsedNotes = parsed.notes;
  }

  return updated;
}

function applyMeasurements(measurements: any, parsed: Record<string, any>): any {
  const updated = { ...measurements };

  // Normalize field names and apply
  for (const [key, value] of Object.entries(parsed)) {
    const normalized = key.toLowerCase().replace(/[_\s]/g, '');

    // Try direct field match first
    if (key in updated) {
      updated[key] = value;
      continue;
    }

    // Try common ceiling/room measurements
    if (normalized.includes('ceiling') && normalized.includes('height')) {
      updated.ceilingHeight = value;
    }
    // Soffit measurements
    else if (normalized.includes('soffit')) {
      if (normalized.includes('height') || normalized.includes('h')) updated.soffitH = value;
      else if (normalized.includes('width') || normalized.includes('w')) updated.soffitW = value;
      else if (normalized.includes('depth') || normalized.includes('d')) updated.soffitD = value;
      else updated.hasSoffit = value === 'true' || value === true;
    }
    // Wall measurements
    else if (normalized.includes('wall')) {
      applyWallMeasurement(updated, key, value);
    }
    // Island measurements (Kitchen-specific)
    else if (normalized.includes('island')) {
      applyIslandMeasurement(updated, key, value);
    }
    // Island sink
    else if (normalized.includes('sink') && (normalized.includes('island') || updated.iSink !== undefined)) {
      applyIslandSink(updated, key, value);
    }
    // Island cooktop
    else if (normalized.includes('cooktop') && updated.iCooktop !== undefined) {
      applyIslandCooktop(updated, key, value);
    }
    // Island outlet
    else if (normalized.includes('outlet') && updated.iOutlet !== undefined) {
      applyIslandOutlet(updated, key, value);
    }
  }

  return updated;
}

function applyQuestions(questions: any, parsed: Record<string, any>): any {
  const updated = { ...questions };

  for (const [key, value] of Object.entries(parsed)) {
    const normalized = key.toLowerCase().replace(/[_\s]/g, '');

    // Direct field match
    if (key in updated) {
      updated[key] = value;
      continue;
    }

    // Try to find matching question field
    for (const qKey of Object.keys(updated)) {
      const qNormalized = qKey.toLowerCase().replace(/[_\s]/g, '');
      if (qNormalized === normalized) {
        updated[qKey] = value;
        break;
      }
    }

    // Fallback: try to set directly with normalized key
    const camelCase = normalized.replace(/^./, (x) => x.toUpperCase()).replace(/([A-Z])/g, (x) => x.toLowerCase());
    if (camelCase && camelCase !== normalized) {
      updated[camelCase] = value;
    }
  }

  return updated;
}

function applyWallMeasurement(measurements: any, key: string, value: any): void {
  const normalized = key.toLowerCase().replace(/[_\s]/g, '');

  // Get wall index from key (wall A = 0, wall B = 1, etc.)
  const wallMatch = key.match(/wall\s*([a-d])/i);
  if (wallMatch && measurements.walls) {
    const wallIndex = wallMatch[1].toUpperCase().charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
    if (measurements.walls[wallIndex]) {
      const wall = measurements.walls[wallIndex];
      if (normalized.includes('length')) wall.length = value;
      else if (normalized.includes('height')) wall.ceilH = value;
      else if (normalized.includes('window')) {
        if (!wall.windows) wall.windows = [];
        if (typeof value === 'number') {
          // Ensure we have enough window entries
          while (wall.windows.length < value) {
            wall.windows.push({});
          }
        }
      }
      else if (normalized.includes('door')) {
        if (!wall.doors) wall.doors = [];
        if (typeof value === 'number') {
          while (wall.doors.length < value) {
            wall.doors.push({});
          }
        }
      }
      else if (normalized.includes('outlet')) {
        if (!wall.outlets) wall.outlets = [];
        if (typeof value === 'number') {
          while (wall.outlets.length < value) {
            wall.outlets.push({});
          }
        }
      }
    }
  }
}

function applyIslandMeasurement(measurements: any, key: string, value: any): void {
  const normalized = key.toLowerCase().replace(/[_\s]/g, '');
  if (normalized.includes('length') || normalized.includes('len')) measurements.iLen = value;
  else if (normalized.includes('width') || normalized.includes('w')) measurements.iW = value;
  else measurements.hasIsland = value === 'true' || value === true;
}

function applyIslandSink(measurements: any, key: string, value: any): void {
  const normalized = key.toLowerCase().replace(/[_\s]/g, '');
  if (normalized.includes('type')) measurements.iSinkType = value;
  else measurements.iSink = value === 'true' || value === true;
}

function applyIslandCooktop(measurements: any, key: string, value: any): void {
  const normalized = key.toLowerCase().replace(/[_\s]/g, '');
  if (normalized.includes('length') || normalized.includes('len')) measurements.iCooktopLen = value;
  else if (normalized.includes('width') || normalized.includes('w')) measurements.iCooktopW = value;
  else measurements.iCooktop = value === 'true' || value === true;
}

function applyIslandOutlet(measurements: any, _key: string, value: any): void {
  measurements.iOutlet = value === 'true' || value === true;
}
