const bcrypt = require("bcryptjs");
const pool = require("../config/database");

const DEFAULT_ROLE = "customer";
const SAFE_COLUMNS = "id, full_name, email, phone, role, is_active, created_at";

async function getUsers(req, res) {
  try {
    const result = await pool.query(
      `SELECT ${SAFE_COLUMNS} FROM users ORDER BY id`
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve users"
    });
  }
}

async function getUserById(req, res) {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }
    const isAdmin = req.user.role === "admin";
    const isOwner = String(req.user.id) === String(userId);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Forbidden"
      });
    }

    const result = await pool.query(
      `SELECT ${SAFE_COLUMNS} FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user"
    });
  }
}

async function createUser(req, res) {
  try {
    const { full_name, email, phone, password, role } = req.body || {};

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "full_name, email and password are required"
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Email format is invalid"
      });
    }

    if (typeof password !== "string" || password.length < 8 || password.length > 72) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 8 and 72 characters"
      });
    }


    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${SAFE_COLUMNS}`,
      [full_name, email, phone || null, passwordHash, role || DEFAULT_ROLE]
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Email already exists"
      });
    }

    if (error.code === "23514") {
      return res.status(400).json({
        success: false,
        message: "Invalid role"
      });
    }

    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create user"
    });
  }
}

async function updateUserStatus(req, res) {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    const { is_active } = req.body || {};

    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "is_active must be true or false"
      });
    }

    const result = await pool.query(
      `UPDATE users SET is_active = $1 WHERE id = $2
       RETURNING ${SAFE_COLUMNS}`,
      [is_active, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update user status"
    });
  }
}

module.exports = { getUsers, getUserById, createUser, updateUserStatus };