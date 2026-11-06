const requireAllowedOrigin = (req, res, next) => {
  const origin = req.get("origin");
  if (origin && origin !== process.env.CORS_ORIGIN) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
};

module.exports = requireAllowedOrigin;