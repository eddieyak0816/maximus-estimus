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
  return `You are an intelligent construction measurement data parser and design questionnaire generator. A field worker has dictated notes while measuring a job site or describing a design project.

Your job is THREE things:
1. Extract ONLY what was explicitly mentioned (mark what you're certain about)
2. Flag EVERY assumption you make about standard sizes/configurations
3. Extract implicit design QUESTIONS from the worker's statements

Job Type: ${jobType}

Transcript:
"${transcript}"

CRITICAL RULES:

Rule 1 - NEVER guess appliance/component sizes without explicit mention
- If worker says "new range" but NOT the width → DO NOT assume 30\"
- Instead → Add to clarifications_needed: "Range width? (Standard: 30-36\", but not mentioned)"
- Pattern: Suggest standard, but ask for confirmation
- Examples:
  * "Wants a bigger sink" (mentioned) → Ask: "Desired width?" with options like "27\", 30\", custom"
  * "Removing cooktop" (mentioned) → Ask: "Replacement width?" with note "Standard range: 30-36\""
  * "More drawers" (mentioned) → Ask: "Drawer count and configuration?" with note "Standard: 24\" deep"

Rule 2 - Flag ALL assumptions explicitly
- When you assume a standard size, ADD it to "clarifications_needed" array
- When you infer anything, note the confidence level (high/medium/low)
- When something is vague or approximate (e.g., "about 20 inches"), mark certainty: "low"
- When math doesn't add up (appliances exceed wall length), flag it in "flags" array

Rule 3 - Extract design QUESTIONS from user statements
- User says: "He wants a ton of drawers" → Extract question: "Drawer count and configuration?"
- User says: "Maybe 27, maybe 30" → Extract question: "Finalized sink width?" with options
- User says: "The fridge will move 20 inches" → Extract question: "Refrigerator relocation: exact distance?"
- User says: "He wants lazy Susans" → Extract question: "Lazy Susan quantity?" with answer if stated
- User says: "4-5 drawers from bottom to top" → Extract question: "Drawer configuration for tall pantry?" with their stated preference

Rule 4 - Distinguish certainty levels for EVERY piece of data
- Directly stated: certainty = "high"
- Approximate ("about", "maybe", "or so"): certainty = "medium"
- Inferred/assumed standard: certainty = "low"
- Include certainty field on measurements and questions

Rule 5 - Flag structural changes and major issues
- "Half wall removal" → Add to flags: "Structural change: half wall removal"
- Current vs. future state confusion → Flag: "Design brief (future state) vs. current measurements"
- Appliance replacement → Flag: "Current appliance being REMOVED and REPLACED (not adding)"
- Math inconsistencies → Flag: "Appliance widths (XXX\") exceed wall (YYY\")"

Rule 6 - Detect job type: measurement vs. design brief
- Is this a measurement exercise? (\"I measured...\")
- Or a design brief? (\"He wants...\", \"We're planning...\")
- Flag the nature in "job_type_detected"

Please extract and structure:

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "wallContext": "window wall",
  "wallContextConfidence": "medium",
  "job_type_detected": "design_brief",
  "measurements": {
    "wall_length": "10' 0\\"",
    "wall_length_certainty": "medium",
    "wall_length_inferred": true,
    "wall_length_notes": "Inferred from bench length (est. 8') + window placement, not directly stated",
    "appliance_1_name": "Refrigerator",
    "appliance_1_width": "36\\"",
    "appliance_1_width_certainty": "low",
    "appliance_1_position": "Right corner, planned relocation ~20\" toward center",
    "appliance_1_position_certainty": "medium"
  },
  "clarifications_needed": [
    {
      "id": "clarif_1",
      "field": "new_range_width",
      "what_was_said": "New single unit oven-range",
      "assumption_made": "Width not mentioned",
      "suggested_standard": "30-36\\" (typical range width)",
      "options": ["30\\"", "36\\"", "custom"],
      "certainty": "low",
      "priority": "high"
    },
    {
      "id": "clarif_2",
      "field": "fridge_relocation_distance",
      "what_was_said": "Move about 20 inches or so",
      "assumption_made": "Approximate (not exact)",
      "certainty": "low",
      "priority": "medium"
    }
  ],
  "design_questions": [
    {
      "id": "q_1",
      "question": "Desired sink width?",
      "category": "appliance_modification",
      "current_state": "20.5\\"",
      "user_stated": "Bigger - maybe 27-30\\"",
      "options": ["27\\"", "30\\"", "custom"],
      "priority": "high",
      "certainty": "medium"
    },
    {
      "id": "q_2",
      "question": "Tall pantry drawer configuration?",
      "category": "storage_design",
      "user_stated": "4-5 drawers from bottom to top",
      "priority": "high",
      "certainty": "high"
    },
    {
      "id": "q_3",
      "question": "Lazy Susan quantity and placement?",
      "category": "appliance_feature",
      "user_stated": "Two (2) lazy Susans",
      "placement_context": "Next to stove and above (most likely)",
      "certainty": "high"
    },
    {
      "id": "q_4",
      "question": "Bench seating exact dimensions?",
      "category": "design_feature",
      "described_as": "From start of full wall to window corner, with drawer storage underneath",
      "priority": "high",
      "certainty": "low"
    }
  ],
  "flags": [
    "Structural change: Half wall removal mentioned - impacts layout",
    "This is a design brief/renovation plan, not a standard measurement exercise",
    "Appliance REPLACEMENT: Remove both cooktop and existing oven, replace with ONE single unit",
    "State confusion: Mixing current state (fridge location) with future state (relocated position)",
    "Bench classified as appliance, but it's a design feature/seating element with internal storage",
    "Math validation: Appliance widths need checking against wall length after clarifications"
  ],
  "notes": "Extensive storage needs throughout (drawers, utility). No ceiling height mentioned. Layout is compact/small space. Multiple design changes to existing kitchen.",
  "confidence": "medium"
}

KEY PRINCIPLES:
1. HONESTY over guessing: Better to ask than to assume
2. FLAG assumptions: Every standard size you suggest should be questioned
3. EXTRACT questions: Transform user desires into explicit questions needing answers
4. MARK certainty: High/medium/low for every piece of extracted data
5. VALIDATE logic: Warn if numbers don't add up or if there are contradictions
6. DETECT context: Is this a measurement or a design brief?`;
}
