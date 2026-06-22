interface ParsedData {
  measurements: Record<string, string | number | boolean>;
  questions: Record<string, string | string[] | boolean>;
  notes: string;
  confidence: 'high' | 'medium' | 'low';
}

export async function parseTranscriptWithHuggingFace(
  transcript: string,
  apiKey: string,
  jobType: 'Kitchen' | 'Bathroom' | 'Flooring' | 'Painting' | 'Living Room' | 'Bedroom' | 'Deck' = 'Kitchen'
): Promise<ParsedData> {
  if (!apiKey) {
    throw new Error('Hugging Face API key not configured. Please add VITE_HUGGINGFACE_API_KEY to your .env.local');
  }

  const prompt = generateParsingPrompt(transcript, jobType);

  try {
    // Use Hugging Face Inference API with text-generation
    const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1', {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.3,
          top_p: 0.9,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Hugging Face API error: ${error.error || 'Unknown error'}`);
    }

    const data = await response.json();

    // HuggingFace returns array with generated_text
    let content = '';
    if (Array.isArray(data) && data[0]?.generated_text) {
      content = data[0].generated_text;
    } else if (data.generated_text) {
      content = data.generated_text;
    }

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Hugging Face response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      measurements: parsed.measurements || {},
      questions: parsed.questions || {},
      notes: parsed.notes || '',
      confidence: parsed.confidence || 'medium',
    };
  } catch (err) {
    console.error('Error parsing with Hugging Face:', err);
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
