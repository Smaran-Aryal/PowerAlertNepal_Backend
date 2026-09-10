const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  let isKnownError = Boolean(err.statusCode);

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    isKnownError = true;
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field
      ? `${field} already exists`
      : "Duplicate field value";
    isKnownError = true;
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for field: ${err.path}`;
    isKnownError = true;
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
    isKnownError = true;
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired";
    isKnownError = true;
  }

  console.error(err);

  if (!isKnownError) {
    statusCode = statusCode >= 400 && statusCode < 500 ? statusCode : 500;
    message = "Something went wrong. Please try again later.";
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = errorHandler;