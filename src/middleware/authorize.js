const { logEvent } = require("../utils/logger");

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      logEvent("ACCESS_DENIED", { req, detail: `required=${roles.join(",")}` });
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
}

module.exports = authorize;