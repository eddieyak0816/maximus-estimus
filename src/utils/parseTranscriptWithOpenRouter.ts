interface ParsedData {
  measurements: Record<string, string | number | boolean>;
  questions: Record<string, string | string[] | boolean>;
  notes: string;
  confidence: 'high' | 'medium' | 'low';
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
  };
}

function generateParsingPrompt(transcript: string, jobType: string): string {
  return `You are a construction measurement data parser. A field worker has dictated the following notes while measuring a job site. Parse this transcript and extract structured data.

Job Type: ${jobType}

Transcript:
"${transcript}"

Please extract:
1. Measurements (wall lengths, heights, widths, etc.) - use consistent units (feet/inches as "X' Y\"" format)
2. Answers to common questions (yes/no, material choices, preferences)
3. Special notes or observations
4. Your confidence in the parsing (high/medium/low)

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "measurements": {
    "wall_a_length": "12' 3\\"",
    "ceiling_height": "9'",
    "window_count": 2
  },
  "questions": {
    "has_soffit": true,
    "countertop_material": "granite",
    "cabinet_color": "white"
  },
  "notes": "Any special observations or unclear measurements that need clarification",
  "confidence": "high"
}

Be conservative - only include measurements and answers you're confident about. Leave out uncertain data.`;
}
