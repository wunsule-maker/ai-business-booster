module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { question, context } = req.body || {};
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'gpt-5', store: false, instructions: `You are an AI Employee. Give concise, practical business advice. Never claim messages were sent. Context: ${JSON.stringify(context)}`, input: question })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'AI request failed');
    res.status(200).json({ answer: data.output_text });
  } catch (error) { res.status(500).json({ error: error.message }); }
};
