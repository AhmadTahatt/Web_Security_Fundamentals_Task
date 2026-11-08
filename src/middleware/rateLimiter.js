const rateLimit = require("express-rate-limit");
const { logEvent } = require("../utils/logger");

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MINUTES || 15) * 60 * 1000;

function limiter(max, message, label) {
  return rateLimit({
    windowMs,
    limit: max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      logEvent("RATE_LIMIT_EXCEEDED", { req, detail: label });
      res.status(options.statusCode).json({ success: false, message });
    }
  });
}

const generalLimiter = limiter(Number(process.env.RATE_LIMIT_MAX || 100), "Too many requests, please try again later", "general");
const loginLimiter = limiter(Number(process.env.LOGIN_RATE_LIMIT_MAX || 5), "Too many login attempts, please try again later", "login");

module.exports = { generalLimiter, loginLimiter };