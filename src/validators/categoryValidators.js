const { z } = require("zod");

const createCategorySchema = z.object({
  name: z
    .string({ message: "Name is required and must be text" })
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  description: z.string().trim().max(500, "Description must be at most 500 characters").nullish()
});

const updateCategorySchema = createCategorySchema.extend({
  is_active: z.boolean({ message: "is_active must be true or false" }).default(true)
});

module.exports = { createCategorySchema, updateCategorySchema };