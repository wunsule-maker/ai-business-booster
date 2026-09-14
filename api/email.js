module.exports = (req, res) => {
  res.status(410).json({
    error: 'Email sending is not enabled in this early-access version.'
  });
};
