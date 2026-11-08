const { z } = require("zod");

const registerSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(72),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,20}$/).nullish()
}).strict(); // rejects unknown keys like "role"

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, "Password must be at least 8 characters").max(72, "Password must be at most 72 characters"),
}).strict();

module.exports = { registerSchema, loginSchema };