module.exports = (req, res) => {
  res.status(200).json({
    ok: true,
    services: {
      openai: Boolean(process.env.OPENAI_API_KEY),
      brevo: Boolean(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL),
      stripe: Boolean(process.env.STRIPE_SECRET_KEY)
    }
  });
};
