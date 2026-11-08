const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(__dirname, "..", "..", "logs");
const LOG_FILE = path.join(LOG_DIR, "security.log");

try {
  fs.mkdirSync(LOG_DIR, { recursive: true });
} catch (error) {
  // logging must never crash the API
}

// Only these fields are ever written. Bodies, headers, tokens and
// passwords are never read here, so they cannot leak into the log.
function logEvent(event, { req, userId, action, detail } = {}) {
  const entry = {
    time: new Date().toISOString(),
    event,
    userId: userId ?? (req && req.user ? req.user.id : null),
    role: req && req.user ? req.user.role : null,
    ip: req ? req.ip : null,
    method: req ? req.method : null,
    path: req && req.originalUrl ? req.originalUrl.split("?")[0] : null,
    action: action || null,
    detail: detail || null
  };

  const line = JSON.stringify(entry);
  console.log("[SECURITY]", line);
  fs.appendFile(LOG_FILE, line + "\n", () => {});
}

// Logs successful admin operations (status below 400) once the response is sent.
function audit(action) {
  return (req, res, next) => {
    res.on("finish", () => {
      if (res.statusCode < 400) {
        logEvent("ADMIN_ACTION", { req, action, detail: `target=${req.params.id || "n/a"}` });
      }
    });
    next();
  };
}

module.exports = { logEvent, audit };