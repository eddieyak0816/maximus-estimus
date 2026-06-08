import type { KitchenAssessment, BathroomAssessment, FlooringAssessment, ParsedResult, WallData } from '../types';

type JobData = KitchenAssessment | BathroomAssessment | FlooringAssessment | any;

/**
 * Apply parsed transcript data to create/update an AI Wall
 * Creates a new "Wall (AI)" or appends to existing one
 */
export function applyParsedDataToJobAsAIWall(
  job: JobData,
  parsed: ParsedResult,
  wallName: string
): JobData {
  if (!job || !job.measurements) return job;

  const updated = { ...job };
  const measurements = { ...updated.measurements };

  // Ensure walls array exists
  if (!measurements.walls) {
    measurements.walls = [];
  }

  // Find or create AI wall
  const aiWallName = wallName.includes('(AI)') ? wallName : `${wallName} (AI)`;
  let aiWall = measurements.walls.find((w: WallData) => w.name === aiWallName);

  if (!aiWall) {
    // Create new AI wall
    aiWall = { name: aiWallName };
    measurements.walls.push(aiWall);
  } else {
    // Clone existing so we can append to it
    aiWall = { ...aiWall };
    const wallIndex = measurements.walls.findIndex((w: WallData) => w.name === aiWallName);
    measurements.walls[wallIndex] = aiWall;
  }

  // Apply parsed measurements to the AI wall
  if (parsed.measurements && typeof parsed.measurements === 'object') {
    applyMeasurementsToAIWall(aiWall, parsed.measurements);
  }

  // Apply questions if any (store in wall notes for now)
  if (parsed.questions && Object.keys(parsed.questions).length > 0) {
    if (!aiWall.cabinetNotes) {
      aiWall.cabinetNotes = '';
    }
    // Append question data to notes
    const questionStr = Object.entries(parsed.questions)
      .map(([k, v]) => `${k}: ${v}`)
      .join('; ');
    if (aiWall.cabinetNotes) {
      aiWall.cabinetNotes += ` | ${questionStr}`;
    } else {
      aiWall.cabinetNotes = questionStr;
    }
  }

  updated.measurements = measurements;
  return updated;
}

/**
 * Apply parsed measurements directly to an AI wall (appending)
 */
function applyMeasurementsToAIWall(wall: WallData, parsed: Record<string, any>): void {
  for (const [key, value] of Object.entries(parsed)) {
    if (value === null || value === undefined || value === '') continue;

    const normalized = key.toLowerCase().replace(/[_\s]/g, '');

    // Wall basics
    if (normalized.includes('length') || normalized === 'walllength') {
      wall.length = String(value);
    } else if (normalized.includes('height') && normalized.includes('ceil')) {
      wall.ceilH = String(value);
    }
    // Soffit
    else if (normalized.includes('soffit') && normalized.includes('height')) {
      wall.sH = String(value);
    } else if (normalized.includes('soffit') && normalized.includes('width')) {
      wall.sW = String(value);
    } else if (normalized.includes('soffit') && normalized.includes('depth')) {
      wall.sD = String(value);
    }
    // Windows (append to array)
    else if (normalized.includes('window')) {
      if (!wall.windows) wall.windows = [];
      if (typeof value === 'number') {
        // If it's a count, add that many empty windows
        const currentCount = wall.windows.length;
        if (value > currentCount) {
          for (let i = currentCount; i < value; i++) {
            wall.windows.push({ insideWidth: '', insideHeight: '' });
          }
        }
      } else if (typeof value === 'string') {
        // If it's a description, create a window with that info
        wall.windows.push({ insideWidth: '', insideHeight: '' });
      }
    }
    // Doors (append to array)
    else if (normalized.includes('door')) {
      if (!wall.doors) wall.doors = [];
      if (typeof value === 'number') {
        const currentCount = wall.doors.length;
        if (value > currentCount) {
          for (let i = currentCount; i < value; i++) {
            wall.doors.push({ type: 'Door', insideWidth: '', insideHeight: '' });
          }
        }
      } else if (typeof value === 'string') {
        wall.doors.push({ type: 'Door', insideWidth: '', insideHeight: '' });
      }
    }
    // Outlets (append to array)
    else if (normalized.includes('outlet')) {
      if (!wall.outlets) wall.outlets = [];
      if (typeof value === 'number') {
        const currentCount = wall.outlets.length;
        if (value > currentCount) {
          for (let i = currentCount; i < value; i++) {
            wall.outlets.push({ location: '', type: 'Outlet' });
          }
        }
      } else if (typeof value === 'string') {
        wall.outlets.push({ location: String(value), type: 'Outlet' });
      }
    }
    // Appliances (append to array)
    else if (normalized.includes('appliance')) {
      if (!wall.appliances) wall.appliances = [];
      if (typeof value === 'string') {
        wall.appliances.push({ name: String(value), loc: '' });
      }
    }
    // Sink information (merge/append)
    else if (normalized.includes('sink')) {
      if (normalized.includes('base') || normalized.includes('width')) {
        wall.sinkCabDesiredW = String(value);
      } else if (normalized.includes('location') || normalized.includes('loc')) {
        wall.sinkLoc = String(value);
      } else if (normalized.includes('type')) {
        wall.sinkType = String(value);
      } else if (normalized === 'sink') {
        // Just "sink" = has sink
        wall.hasSink = value === true || value === 'true' || value === 'yes';
      }
    } else if (normalized === 'hassink') {
      wall.hasSink = value === true || value === 'true' || value === 'yes';
    }
    // Faucet
    else if (normalized.includes('faucet')) {
      wall.faucetLoc = String(value);
    }
    // Dishwasher line
    else if (normalized.includes('dishwasher') || normalized === 'dwline') {
      wall.dwLine = String(value);
    }
    // Instant hot water line
    else if (normalized.includes('instanthotwater') || normalized === 'imline') {
      wall.imLine = String(value);
    }
    // Disposal
    else if (normalized.includes('disposal') || normalized === 'disposal') {
      wall.disposal = value === true || value === 'true' || value === 'yes';
    }
    // Cabinets
    else if (normalized.includes('uppercab') || normalized.includes('uppercabinet')) {
      wall.hasUpperCabs = value === true || value === 'true' || value === 'yes';
    } else if (normalized.includes('uppercabh') || (normalized.includes('upper') && normalized.includes('height'))) {
      wall.upperCabH = String(value);
    } else if (normalized.includes('lowercab') || normalized.includes('basecab')) {
      // Find the base cabinet height/depth field (might be in different names)
      if (normalized.includes('height')) {
        // No standard field for base height, store in notes
        if (!wall.cabinetNotes) wall.cabinetNotes = '';
        wall.cabinetNotes += (wall.cabinetNotes ? ' | ' : '') + `base cabinet height: ${value}`;
      }
    }
  }
}

/**
 * Get wall context from parsed data - returns likely wall name if available
 */
export function extractWallContext(wallContext: string | null | undefined): string | null {
  if (!wallContext) return null;

  const normalized = wallContext.toLowerCase().trim();

  // Common wall context patterns
  if (normalized.includes('sink')) return 'Sink Wall';
  if (normalized.includes('window')) return 'Window Wall';
  if (normalized.includes('door')) return 'Door Wall';
  if (normalized.includes('island')) return 'Island';
  if (normalized.includes('pantry')) return 'Pantry Wall';
  if (normalized.includes('entrance') || normalized.includes('entry')) return 'Entry Wall';
  if (normalized.includes('prep')) return 'Prep Wall';
  if (normalized.includes('range') || normalized.includes('cooktop')) return 'Range Wall';

  // If it's already a reasonable name, use it as-is
  if (wallContext.length > 2 && wallContext.length < 40) {
    return wallContext.charAt(0).toUpperCase() + wallContext.slice(1);
  }

  return null;
}
