module.exports = (req, res) => {
  res.status(200).json({
    ok: true,
    services: {
      openai: Boolean(process.env.OPENAI_API_KEY)
    }
  });
};
