import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const advisorRouter = Router();

interface CropEntry {
  x: number;
  y: number;
  crop: string;
  stage: string;
  wateredToday: boolean;
}

interface GameContext {
  day: number;
  timeOfDay: string;
  inventory: {
    seeds: Record<string, number>;
    harvested: Record<string, number>;
  };
  crops: CropEntry[];
}

const MODEL = 'gemini-2.5-flash';
const MAX_TOKENS = 1024;
const MAX_USER_MESSAGE_CHARS = 1000;
const MAX_HISTORY_MESSAGES = 10;

const STATIC_SYSTEM_PROMPT = `You are Sage, a friendly farming advisor inside CropCraft — a 3D farming simulator that teaches real-world agricultural literacy and the UN Sustainable Development Goals.

Game mechanics:
- Crops: turnip (3 days total), potato (5 days total), cauliflower (8 days total).
- Each crop has 4 stages: Seed → Sprout → Growing → Mature.
- Crops must be watered every day to advance to the next stage. Unwatered crops do not grow.
- Tools: Hoe (till dirt), Watering Can (water tilled soil), Seeds (plant on tilled/watered soil), Hand (harvest mature).
- A day lasts 45 seconds in real time and cycles Morning → Afternoon → Evening → Night.
- Harvest mature crops with the Hand tool (key 4). Press Q to cycle seed types.

How you respond:
- Be concise (2–4 sentences) and friendly. Use plain text — no markdown headings or code blocks.
- When the player asks about a game action, answer the action first, then add one short real-world farming or sustainability insight when it fits.
- Reference the live farm state shown in the user message (day, crops, inventory) when it makes the answer more useful — never invent state that isn't there.
- If the player asks something off-topic from farming, gently steer back to the game.
- Never claim to perform actions yourself — you only advise; the player controls the farm.`;

let cachedClient: GoogleGenerativeAI | null = null;
function getClient(apiKey: string): GoogleGenerativeAI {
  if (!cachedClient) cachedClient = new GoogleGenerativeAI(apiKey);
  return cachedClient;
}

function formatGameState(ctx: GameContext): string {
  const seeds = Object.entries(ctx.inventory.seeds)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `${k}×${n}`)
    .join(', ') || 'none';

  const harvested = Object.entries(ctx.inventory.harvested)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `${k}×${n}`)
    .join(', ') || 'none';

  const cropList = ctx.crops.length === 0
    ? 'none planted'
    : ctx.crops
        .map(c => `  - ${c.crop} at (${c.x},${c.y}) — ${c.stage}${c.wateredToday ? ', watered today' : ', NOT watered today'}`)
        .join('\n');

  return `[Live farm state]
Day: ${ctx.day}
Time of day: ${ctx.timeOfDay}
Seeds: ${seeds}
Harvested: ${harvested}
Active crops:
${cropList}`;
}

advisorRouter.post('/chat', async (req: Request, res: Response): Promise<void> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    res.status(503).json({
      error: 'AI Advisor is not configured yet. Add GEMINI_API_KEY to server/.env to enable it.',
    });
    return;
  }

  const { message, gameContext, history } = req.body as {
    message?: string;
    gameContext?: GameContext;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  };

  if (!message || typeof message !== 'string' || message.trim() === '') {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  const userText = message.trim().slice(0, MAX_USER_MESSAGE_CHARS);

  const ctx: GameContext = gameContext ?? {
    day: 1,
    timeOfDay: 'morning',
    inventory: { seeds: {}, harvested: {} },
    crops: [],
  };

  const prior = (Array.isArray(history) ? history : [])
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_HISTORY_MESSAGES);

  try {
    const genAI = getClient(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: STATIC_SYSTEM_PROMPT,
    });

    const chat = model.startChat({
      history: prior.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        maxOutputTokens: MAX_TOKENS,
      },
    });

    const result = await chat.sendMessage(`${formatGameState(ctx)}\n\n${userText}`);
    const reply = result.response.text().trim();

    res.json({ reply });
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string };
    const status = error.status;
    const msg = error.message ?? '';

    if (status === 401 || status === 403 || /API key/i.test(msg)) {
      console.error('[advisor] Invalid Gemini API key');
      res.status(503).json({ error: 'AI Advisor authentication failed. Check the GEMINI_API_KEY in server/.env.' });
      return;
    }
    if (status === 429) {
      res.status(429).json({ error: 'The advisor is busy right now. Please try again in a moment.' });
      return;
    }
    console.error('[advisor] Unexpected error:', err);
    res.status(500).json({ error: 'Something went wrong on the server.' });
  }
});
