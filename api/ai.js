const SUPABASE_URL = 'https://whckprbkwukhcgwrzprd.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_LvPPfat0-_Gho2By_rCWgg_FeCXj2IC';
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 12;
const requestWindows = new Map();

async function currentUser(req) {
  const authorization = req.headers.authorization || '';
  if (!authorization.startsWith('Bearer ')) return null;

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: authorization
    }
  });

  return response.ok ? response.json() : null;
}

function allowRequest(userId) {
  const now = Date.now();
  const recent = (requestWindows.get(userId) || []).filter(time => now - time < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) return false;
  recent.push(now);
  requestWindows.set(userId, recent);
  return true;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ error: 'Please sign in to use the AI Employee.' });

    const question = String(req.body?.question || '').trim();
    const context = req.body?.context || {};
    if (!question) return res.status(400).json({ error: 'Ask the AI Employee a question first.' });
    if (question.length > 800) return res.status(400).json({ error: 'Please keep your question under 800 characters.' });
    if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'The AI Employee is being connected. Please try again shortly.' });
    if (!allowRequest(user.id)) return res.status(429).json({ error: 'You have reached the AI limit for now. Please try again in a few minutes.' });

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-5',
        store: false,
        instructions: `You are an AI Employee. Give concise, practical business advice. Never claim messages were sent. Context: ${JSON.stringify(context).slice(0, 12000)}`,
        input: question
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'AI request failed');
    res.status(200).json({ answer: data.output_text || 'I could not create an answer this time.' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'The AI Employee could not respond right now.' });
  }
};
