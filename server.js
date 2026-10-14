import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini SDK with User-Agent header
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasApiKey: Boolean(apiKey) });
});

// Resilient Gemini query with model cascade
async function queryGemini(prompt) {
  if (!ai) throw new Error('GEMINI_API_KEY is not configured on the server.');

  const models = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
  let lastError = null;

  for (const model of models) {
    try {
      console.log(`[Gemini] Requesting model ${model}...`);
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const raw = response.text ? response.text.trim() : '';
      try {
        return JSON.parse(raw);
      } catch (e) {
        const jsonMatch = raw.match(/\[[\s\S]*\]/) || raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error('Could not parse JSON response from Gemini');
      }
    } catch (err) {
      console.warn(`[Gemini] Model ${model} failed (${err.status || err.message}), trying next model...`);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini models failed to generate content.');
}

// Generate a chunk of questions for a specific topic directly from Gemini
async function generateQuestionBatch(topic, startId, count, difficultyTier) {
  const prompt = `You are Pip, an enthusiastic owl study buddy.
Generate exactly ${count} multiple choice questions (numbered ${startId} through ${startId + count - 1}) specifically about the topic: "${topic}".
Difficulty level: ${difficultyTier}.

Instructions:
1. Every question MUST be authentic, factually accurate, and directly about "${topic}".
2. Provide exactly 4 plausible options per question.
3. "correctAnswer" must be an integer index (0, 1, 2, or 3) indicating the right answer.
4. "hint" must be a clever, encouraging clue from Pip that helps the learner reason through the question without directly naming the exact answer.
5. "explanation" must be a concise, friendly 1-2 sentence explanation.
6. "funFact" must be an interesting trivia tidbit.
7. "category" is a subcategory of "${topic}".

Format: Return a JSON array strictly matching:
[
  {
    "id": ${startId},
    "question": "Clear and engaging question about ${topic}?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "hint": "Pip's clever clue to guide you",
    "explanation": "Why this answer is correct",
    "funFact": "Interesting trivia fact",
    "difficulty": "${difficultyTier}",
    "category": "Subtopic of ${topic}"
  }
]`;

  const parsed = await queryGemini(prompt);
  const items = Array.isArray(parsed) ? parsed : parsed.questions || [];

  return items.map((q, idx) => {
    const rawOpts = Array.isArray(q.options) && q.options.length >= 4 ? q.options.slice(0, 4) : [];
    const options = rawOpts.length === 4 ? rawOpts.map((o) => String(o).trim()) : [
      String(q.options?.[0] || 'Option A'),
      String(q.options?.[1] || 'Option B'),
      String(q.options?.[2] || 'Option C'),
      String(q.options?.[3] || 'Option D'),
    ];

    let correctIdx = typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer < 4
      ? q.correctAnswer
      : 0;

    return {
      id: startId + idx,
      question: String(q.question || `Question about ${topic}`),
      options,
      correctAnswer: correctIdx,
      hint: String(q.hint || `Look closely at the key words in the question, or rule out the most extreme choices!`),
      explanation: String(q.explanation || `The correct answer is "${options[correctIdx]}".`),
      funFact: String(q.funFact || `An interesting fact about ${topic}!`),
      difficulty: difficultyTier,
      category: String(q.category || topic),
    };
  });
}

// Generate 50 MCQs endpoint - Always passes topic to Gemini
app.post('/api/quiz/generate', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'Please enter a topic to learn.' });
    }

    const cleanTopic = topic.trim();
    console.log(`[Quizzy] Generating 50 MCQs with Gemini for: "${cleanTopic}"`);

    // Run 2 parallel batches of 25 with Gemini for speed and reliability
    const [batch1, batch2] = await Promise.all([
      generateQuestionBatch(cleanTopic, 1, 25, 'easy'),
      generateQuestionBatch(cleanTopic, 26, 25, 'hard'),
    ]);

    let allQuestions = [...batch1, ...batch2];

    // If any questions are missing to hit 50, request top-up from Gemini
    if (allQuestions.length < 50) {
      const missingCount = 50 - allQuestions.length;
      try {
        const topUp = await generateQuestionBatch(cleanTopic, allQuestions.length + 1, missingCount, 'medium');
        allQuestions = [...allQuestions, ...topUp];
      } catch (e) {
        console.warn('Top-up batch failed:', e);
      }
    }

    // Re-index questions cleanly 1 to 50
    allQuestions = allQuestions.slice(0, 50).map((q, idx) => ({
      ...q,
      id: idx + 1,
    }));

    return res.json({
      topic: cleanTopic,
      title: `${cleanTopic}: 50-Question Master Quiz`,
      description: `Test and level up your mastery of ${cleanTopic} with Pip!`,
      totalQuestions: allQuestions.length,
      questions: allQuestions,
      source: 'gemini-ai',
    });
  } catch (error) {
    console.error('Error in /api/quiz/generate:', error);
    return res.status(500).json({
      error: error.message || 'Gemini could not generate questions right now. Please try again.',
    });
  }
});

// Vite middleware integration for full-stack dev / production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Quizzy fullstack server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
