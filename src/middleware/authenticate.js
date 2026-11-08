const jwt = require("jsonwebtoken");
const { logEvent } = require("../utils/logger");

function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.trim().split(/\s+/);

  if (scheme !== "Bearer" || !token) {
    logEvent("AUTH_MISSING_TOKEN", { req });
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (error) {
    logEvent("AUTH_INVALID_TOKEN", { req });
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

module.exports = authenticate;