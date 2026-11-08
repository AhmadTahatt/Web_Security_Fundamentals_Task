const { z } = require("zod");

const createUserSchema = z.object({
  full_name: z
    .string({ message: "Full name is required and must be text" })
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters"),
  email: z
    .string({ message: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Email format is invalid")
    .max(255),
  password: z
    .string({ message: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,20}$/, "Phone format is invalid").nullish(),
  role: z.enum(["customer", "admin"], { message: "Role must be customer or admin" }).optional()
});

const updateStatusSchema = z.object({
  is_active: z.boolean({ message: "is_active must be true or false" })
});

module.exports = { createUserSchema, updateStatusSchema };