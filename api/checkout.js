const prices = {
  starter: 'price_1UEPdRBbEfQOhUsrQynR4XAr',
  growth: 'price_1UEPeHBbEfQOhUsrhPY8eb8b',
  pro: 'price_1UEPeeBbEfQOhUsrnEIgU5OE'
};

const productionOrigin = 'https://ai-business-boost-gamma.vercel.app';
const allowedOrigins = new Set([productionOrigin, 'http://localhost:3000']);

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const price = prices[body.plan];
    if (!price) throw new Error('Choose a valid plan.');

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error('Payments are not configured yet. Please try again shortly.');
    }

    const origin = allowedOrigins.has(req.headers.origin) ? req.headers.origin : productionOrigin;
    const form = new URLSearchParams({
      mode: 'subscription',
      payment_method_collection: 'always',
      'line_items[0][price]': price,
      'line_items[0][quantity]': '1',
      success_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?payment=cancel`,
      'subscription_data[trial_period_days]': '30',
      'subscription_data[trial_settings][end_behavior][missing_payment_method]': 'cancel'
    });

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: form
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Checkout could not start.');
    }
    if (!data.url) throw new Error('Checkout did not return a secure payment link.');

    return res.status(200).json({ url: data.url });
  } catch (error) {
    console.error('Stripe checkout failed:', error);
    return res.status(500).json({
      error: error instanceof SyntaxError
        ? 'Checkout request could not be read. Please try again.'
        : (error.message || 'Checkout could not start. Please try again.')
    });
  }
};
