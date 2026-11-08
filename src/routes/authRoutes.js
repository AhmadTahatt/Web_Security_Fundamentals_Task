const express = require("express");
const { register, login, me } = require("../controllers/authController");
const validate = require("../middleware/validate");
const authenticate = require("../middleware/authenticate");
const { loginLimiter } = require("../middleware/rateLimiter");
const { registerSchema, loginSchema } = require("../validators/authValidators");

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", loginLimiter, validate(loginSchema), login);
router.get("/me", authenticate, me);

module.exports = router;