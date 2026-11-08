function errorHandler(error, req, res, next) {
  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON in request body"
    });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request body too large"
    });
  }

  res.status(error.status || 500).json({
    success: false,
    message: "Internal server error"
  });
}

module.exports = errorHandler;