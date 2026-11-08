const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const { logEvent } = require("../utils/logger");

const SAFE = "id, full_name, email, phone, role, is_active, created_at";
const DUMMY_HASH = bcrypt.hashSync("dummy-password", 12);

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );
}

async function register(req, res, next) {
  try {
    const { full_name, email, phone, password } = req.body;
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, 'customer') RETURNING ${SAFE}`,
      [full_name, email, phone || null, hash]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await pool.query(
      "SELECT id, role, is_active, password_hash FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);

    if (!user || !ok || !user.is_active) {
      logEvent("LOGIN_FAILED", {
        req,
        userId: user ? user.id : null,
        detail: user && !user.is_active ? "inactive_account" : "invalid_credentials"
      });
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    logEvent("LOGIN_SUCCESS", { req, userId: user.id });
    res.status(200).json({ success: true, token: signToken(user) });
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT ${SAFE} FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, me };