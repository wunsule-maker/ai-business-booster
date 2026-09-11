module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { to, subject, html } = req.body || {};
    const response = await fetch('https://api.brevo.com/v3/smtp/email', { method: 'POST', headers: { 'Content-Type': 'application/json', 'api-key': process.env.BREVO_API_KEY }, body: JSON.stringify({ sender: { name: 'AI Business Booster', email: process.env.BREVO_SENDER_EMAIL }, to: [{ email: to }], subject, htmlContent: html }) });
    const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Email could not send.'); res.status(200).json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
};
