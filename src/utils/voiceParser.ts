import type { VoiceContext, VoiceParseResult } from '../types';

const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

if (!apiKey) {
  console.warn('VITE_ANTHROPIC_API_KEY not set in .env.local. Voice features will not work.');
}

export async function parseVoiceInput(context: VoiceContext, transcript: string): Promise<VoiceParseResult> {
  if (!apiKey) {
    return {
      measurements: [],
      drawingCommands: [],
      confirmation: '',
      error: 'API key not configured. Add VITE_ANTHROPIC_API_KEY to .env.local',
    };
  }

  const wallsInfo = context.walls
    .map(w => `${w.label}: ${w.name || 'unnamed'}`)
    .join(', ');

  const systemPrompt = `You are a measurement parsing assistant for a construction field app.
Given a voice transcript from a field worker, extract:
1. Measurement updates (wall lengths, ceiling heights, window counts, appliance details, etc.)
2. Drawing commands (shapes to place on a room sketch canvas)

Current job type: ${context.jobType}
Available walls: ${wallsInfo}
Canvas size: ${context.canvasWidth}x${context.canvasHeight}px

For measurements:
- target: "global" for room-wide measurements, "wall" for wall-specific
- wallIndex: when target is "wall", use 0-based index of the wall
- field: measurement field name (e.g., "length", "ceilingHeight", "windowCount", "hasSink")
- value: the value to set (string, boolean, or number)
- action: for adding features like "addWindow", "addDoor", "addOutlet", "addAppliance"

For drawing commands:
- type: "rect" (rectangle), "line" (line), "text" (label), "freehand" (freehand pen)
- x, y: starting coordinates
- w, h: width/height for rectangles
- x2, y2: end coordinates for lines
- label: text content for text type
- color: hex color (default #eef2ff, navy #1F3096, yellow #F5C42A, red #f87171, green #22c55e)

Respond ONLY with a JSON object matching this schema:
{
  "measurements": [{ "target": "global"|"wall", "wallIndex": number?, "field": string, "value": any, "action": string? }],
  "drawingCommands": [{ "type": "rect"|"line"|"text"|"freehand", "x": number, "y": number, "w": number?, "h": number?, "x2": number?, "y2": number?, "label": string?, "color": string? }],
  "confirmation": "human-readable summary of what will happen"
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: transcript,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API error: ${response.statusText}`);
    }

    const data = await response.json() as { content: Array<{ type: string; text: string }> };
    const content = data.content[0];

    if (!content || content.type !== 'text') {
      return {
        measurements: [],
        drawingCommands: [],
        confirmation: '',
        error: 'Unexpected response format from Claude API',
      };
    }

    // Parse the JSON response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        measurements: [],
        drawingCommands: [],
        confirmation: '',
        error: 'Could not parse Claude response as JSON',
      };
    }

    const parsed = JSON.parse(jsonMatch[0]) as VoiceParseResult;

    // Validate structure
    if (!Array.isArray(parsed.measurements)) parsed.measurements = [];
    if (!Array.isArray(parsed.drawingCommands)) parsed.drawingCommands = [];
    if (!parsed.confirmation) parsed.confirmation = 'No action recognized';

    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      measurements: [],
      drawingCommands: [],
      confirmation: '',
      error: `API error: ${message}`,
    };
  }
}
