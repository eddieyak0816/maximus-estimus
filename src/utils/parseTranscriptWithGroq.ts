interface ParsedData {
  measurements: Record<string, string | number | boolean>;
  questions: Record<string, string | string[] | boolean>;
  notes: string;
  confidence: 'high' | 'medium' | 'low';
}

export async function parseTranscriptWithGroq(
  transcript: string,
  jobType: 'Kitchen' | 'Bathroom' | 'Flooring' | 'Painting' | 'Living Room' | 'Bedroom' | 'Deck' = 'Kitchen'
): Promise<ParsedData> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('Groq API key not configured. Please add VITE_GROQ_API_KEY to your .env.local');
  }

  const prompt = generateParsingPrompt(transcript, jobType);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Groq API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Groq response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      measurements: parsed.measurements || {},
      questions: parsed.questions || {},
      notes: parsed.notes || '',
      confidence: parsed.confidence || 'medium',
    };
  } catch (err) {
    console.error('Error parsing with Groq:', err);
    throw err;
  }
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
