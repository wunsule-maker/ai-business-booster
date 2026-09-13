const prices = { starter: 'price_1UEPdRBbEfQOhUsrQynR4XAr', growth: 'price_1UEPeHBbEfQOhUsrhPY8eb8b', pro: 'price_1UEPeeBbEfQOhUsrnEIgU5OE' };
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const price = prices[req.body?.plan]; if (!price) throw new Error('Choose a valid plan.');
    const origin = req.headers.origin || 'https://example.com';
    const form = new URLSearchParams({ mode: 'subscription', 'line_items[0][price]': price, 'line_items[0][quantity]': '1', success_url: `${origin}/?payment=success`, cancel_url: `${origin}/?payment=cancel`, 'subscription_data[trial_period_days]': '14' });
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', { method: 'POST', headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: form });
    const data = await response.json(); if (!response.ok) throw new Error(data.error?.message || 'Checkout could not start.');
    res.status(200).json({ url: data.url });
  } catch (error) { res.status(500).json({ error: error.message }); }
};
