interface ParsedData {
  measurements: Record<string, string | number | boolean>;
  questions: Record<string, string | string[] | boolean>;
  notes: string;
  confidence: 'high' | 'medium' | 'low';
  wallContext?: string | null; // e.g., "sink wall", "window wall", null if not mentioned
  wallContextConfidence?: 'high' | 'medium' | 'low';
}

// Free models from OpenRouter (in order of preference for fallback)
// See: https://openrouter.ai/models?order=top-weekly&input_modalities=text&max_price=0
const FREE_MODELS = [
  'openai/gpt-oss-120b:free',           // Powerful, best choice
  'nvidia/nemotron-3-super-120b-a12b:free', // Also powerful
  'google/gemma-4-31b-it:free',         // Instruction-tuned fallback
];

export async function parseTranscriptWithOpenRouter(
  transcript: string,
  apiKey: string,
  jobType: 'Kitchen' | 'Bathroom' | 'Flooring' | 'Painting' | 'Living Room' | 'Bedroom' | 'Deck' = 'Kitchen'
): Promise<ParsedData> {
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured. Please add VITE_OPENROUTER_API_KEY to your .env.local');
  }

  const prompt = generateParsingPrompt(transcript, jobType);

  // Try each free model in order
  for (let i = 0; i < FREE_MODELS.length; i++) {
    const model = FREE_MODELS[i];
    try {
      console.log(`Attempting to parse with ${model}...`);
      const result = await tryModel(model, prompt, apiKey);
      console.log(`Successfully parsed with ${model}`);
      return result;
    } catch (err) {
      console.warn(`Model ${model} failed:`, err);
      // If this is the last model, throw the error
      if (i === FREE_MODELS.length - 1) {
        throw new Error(`All models failed. Last error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
      // Otherwise, try the next model
      continue;
    }
  }

  throw new Error('Failed to parse transcript with any available model');
}

async function tryModel(model: string, prompt: string, apiKey: string): Promise<ParsedData> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${apiKey}`,
      'content-type': 'application/json',
      'http-referer': 'https://eddieyak0816.github.io/maximus-estimus/',
      'x-title': 'Maximus Estimus',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenRouter API error: ${error.error?.message || JSON.stringify(error)}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '';

  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to extract JSON from response');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    measurements: parsed.measurements || {},
    questions: parsed.questions || {},
    notes: parsed.notes || '',
    confidence: parsed.confidence || 'medium',
    wallContext: parsed.wallContext || null,
    wallContextConfidence: parsed.wallContextConfidence || 'medium',
  };
}

function generateParsingPrompt(transcript: string, jobType: string): string {
  return `You are an intelligent construction measurement data parser. A field worker has dictated notes while measuring a job site. Your job is to extract AND intelligently infer measurements.

Job Type: ${jobType}

Transcript:
"${transcript}"

INSTRUCTIONS - Be Smart About Wall Calculations:
- If the worker mentions appliances/cabinets with widths (e.g., "36\" fridge", "36\" base cabinet"), intelligently infer:
  * Does the sum of widths likely equal the total wall length?
  * Are there gaps mentioned or implied?
  * Does the worker say these span the "entire wall" or "whole side"?
  * Can you confidently infer wall_length from the components? If yes, include it.
- For each appliance/cabinet, capture: name, width, position (left/right corner, distance from corner), and any other details
- If components don't clearly span the wall, still capture individual measurements but note the uncertainty
- Use your judgment - if 36\" + 36\" is mentioned for a wall and nothing suggests otherwise, infer 72\" length
- Capture position details: "left corner", "33\" from left", "right corner", etc.

Please extract and intelligently infer:
1. Wall context/name (e.g., "sink wall", "window wall", "fridge wall", "island")
2. Wall length (direct statement OR intelligently inferred from component widths)
3. All appliance/cabinet measurements with positions
4. Window/door count and details
5. Special features (sink, disposal, outlets, etc.)
6. Ceiling height, soffit info
7. Any questions answered
8. Observations or gaps

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "wallContext": "fridge wall",
  "wallContextConfidence": "high",
  "measurements": {
    "wall_length": "6' 0\\"",
    "wall_length_inferred": true,
    "wall_length_notes": "Inferred from fridge 36\\\" at left corner + 36\\\" base cabinet to the right",
    "appliance_1_name": "Refrigerator",
    "appliance_1_width": "36\\"",
    "appliance_1_position": "left corner",
    "appliance_2_name": "Base Cabinet",
    "appliance_2_width": "36\\"",
    "appliance_2_position": "adjacent to right of fridge",
    "window_count": 1,
    "ceiling_height": "9' 0\\""
  },
  "questions": {
    "has_disposal": true
  },
  "notes": "Worker mentioned gap space but didn't specify use",
  "confidence": "high"
}

KEY PRINCIPLE: Use AI judgment. Don't be too conservative. If the measurement story makes sense (components add up to wall length, positioning is logical), infer the wall length. Note when you're inferring with "wall_length_inferred": true and "wall_length_notes" explaining your reasoning.`;
}
