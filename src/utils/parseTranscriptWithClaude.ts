interface ParsedData {
  measurements: Record<string, string | number | boolean>;
  questions: Record<string, string | string[] | boolean>;
  notes: string;
  confidence: 'high' | 'medium' | 'low';
}

export async function parseTranscriptWithClaude(
  transcript: string,
  apiKey: string,
  jobType: 'Kitchen' | 'Bathroom' | 'Flooring' | 'Painting' | 'Living Room' | 'Bedroom' | 'Deck' = 'Kitchen'
): Promise<ParsedData> {
  const prompt = generateParsingPrompt(transcript, jobType);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-8',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Claude API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text || '';

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Claude response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      measurements: parsed.measurements || {},
      questions: parsed.questions || {},
      notes: parsed.notes || '',
      confidence: parsed.confidence || 'medium',
    };
  } catch (err) {
    console.error('Error parsing with Claude:', err);
    throw err;
  }
}

export async function summarizeWallWithClaude(
  transcript: string,
  wallName: string,
  apiKey: string
): Promise<string> {
  const prompt = `You are a field measurement assistant for a construction company. A field worker just dictated the following notes while measuring "${wallName}".

Transcript:
"${transcript}"

Write a clean, concise summary of what was said. Focus on:
- Any measurements mentioned (lengths, heights, widths)
- Features noted (windows, doors, outlets, appliances, sink, cabinets)
- Observations or conditions
- Things that need follow-up

Keep it short and factual. Write in plain text, no bullet points, no headers. 2-4 sentences max.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Claude API error');
  }

  const data = await response.json();
  return (data.content[0]?.text || '').trim();
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
