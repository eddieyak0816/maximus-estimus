import type { AIExtractData, AIWallData, ParsedResult, AIExtractAppliance } from '../types';

/**
 * Convert parsed data to an AI wall, with smart merge for existing walls
 * If a wall with the same name exists, merge the data intelligently
 */
export function convertParsedToAIWall(
  parsed: ParsedResult,
  wallName: string,
  existingExtract?: AIExtractData
): AIExtractData {
  const wallContextName = wallName.replace(' (AI)', '').trim();

  // Extract appliances from measurements
  const appliances = extractAppliances(parsed.measurements);

  // Separate measurements into categories
  const measurements = extractMeasurements(parsed.measurements);

  // Create new wall data
  const newWall: AIWallData = {
    id: existingExtract?.walls.find(w => w.name === wallContextName)?.id || `wall-${Date.now()}`,
    name: wallContextName,
    wallContextConfidence: parsed.wallContextConfidence || 'medium',
    measurements,
    appliances,
    features: extractFeatures(parsed.measurements),
    questions: parsed.questions || {},
    notes: parsed.notes || '',
    rawParsed: parsed,
    createdAt: existingExtract?.walls.find(w => w.name === wallContextName)?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: 'ai',
  };

  // Check if wall already exists and merge
  if (existingExtract?.walls) {
    const existingWallIndex = existingExtract.walls.findIndex(w => w.name === wallContextName);
    if (existingWallIndex !== -1) {
      // Smart merge: combine arrays, update objects
      const existing = existingExtract.walls[existingWallIndex];
      const merged = smartMergeWallData(existing, newWall);

      return {
        walls: [
          ...existingExtract.walls.slice(0, existingWallIndex),
          merged,
          ...existingExtract.walls.slice(existingWallIndex + 1),
        ],
      };
    }
  }

  // No existing wall, just add the new one
  return {
    walls: [...(existingExtract?.walls || []), newWall],
  };
}

/**
 * Smart merge two wall objects: combine arrays, update objects, preserve old data
 */
function smartMergeWallData(existing: AIWallData, incoming: AIWallData): AIWallData {
  return {
    ...existing,
    // Update metadata
    wallContextConfidence: incoming.wallContextConfidence,
    updatedAt: new Date().toISOString(),

    // Merge measurements (update existing keys, add new ones)
    measurements: {
      ...existing.measurements,
      ...incoming.measurements,
    },

    // Merge appliances (append new ones, don't duplicate)
    appliances: mergeAppliances(existing.appliances, incoming.appliances),

    // Merge features
    features: {
      ...existing.features,
      ...incoming.features,
    },

    // Merge questions
    questions: {
      ...existing.questions,
      ...incoming.questions,
    },

    // Update notes if new ones provided
    notes: incoming.notes || existing.notes,

    // Keep the original raw parsed for reference
    rawParsed: incoming.rawParsed,
  };
}

/**
 * Merge appliance arrays intelligently (avoid duplicates)
 */
function mergeAppliances(existing: AIExtractAppliance[], incoming: AIExtractAppliance[]): AIExtractAppliance[] {
  const result = [...existing];

  for (const incomingApp of incoming) {
    // Check if appliance with same name already exists
    const exists = result.some(a => a.name?.toLowerCase() === incomingApp.name?.toLowerCase());
    if (!exists) {
      result.push(incomingApp);
    }
  }

  return result;
}

/**
 * Extract measurements from parsed data
 * Filter out appliance data, keep wall-level measurements
 */
function extractMeasurements(parsed: Record<string, any>): Record<string, any> {
  const measurements: Record<string, any> = {};

  for (const [key, value] of Object.entries(parsed)) {
    const normalized = key.toLowerCase();

    // Skip appliance-related keys
    if (normalized.includes('appliance') || normalized.includes('fridge') || normalized.includes('cabinet')) {
      continue;
    }

    // Include wall-level measurements
    measurements[key] = value;
  }

  return measurements;
}

/**
 * Extract appliances from parsed measurements
 */
function extractAppliances(parsed: Record<string, any>): AIExtractAppliance[] {
  const appliances: AIExtractAppliance[] = [];
  const appliancePattern = /appliance_(\d+)_/i;
  const seen = new Set<string>();

  for (const key of Object.keys(parsed)) {
    const match = key.match(appliancePattern);
    if (!match) continue;

    const appNum = match[1];
    const appKey = `appliance_${appNum}`;

    if (seen.has(appKey)) continue;
    seen.add(appKey);

    const name = parsed[`${appKey}_name`];
    const width = parsed[`${appKey}_width`];
    const position = parsed[`${appKey}_position`];

    if (name) {
      appliances.push({
        id: `${appKey}-${Date.now()}`,
        name: String(name),
        width: width ? String(width) : undefined,
        position: position ? String(position) : undefined,
      });
    }
  }

  return appliances;
}

/**
 * Extract features (disposal, dishwasher, backsplash, etc.)
 */
function extractFeatures(parsed: Record<string, any>): Record<string, any> {
  const features: Record<string, any> = {};
  const featureKeywords = ['disposal', 'dishwasher', 'backsplash', 'soffit', 'ceiling', 'window', 'door', 'outlet', 'switch', 'sink'];

  for (const [key, value] of Object.entries(parsed)) {
    const normalized = key.toLowerCase();

    // Check if this key matches a feature keyword
    if (featureKeywords.some(kw => normalized.includes(kw)) && !normalized.includes('appliance')) {
      features[key] = value;
    }
  }

  return features;
}
