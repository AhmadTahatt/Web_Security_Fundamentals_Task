const { z } = require("zod");

const createProductSchema = z.object({
  category_id: z.number({ message: "category_id must be a number" }).int().positive(),
  name: z
    .string({ message: "Name is required and must be text" })
    .trim()
    .min(1, "Name is required")
    .max(200, "Name must be at most 200 characters"),
  description: z.string().trim().max(1000, "Description must be at most 1000 characters").nullish(),
  price: z
    .number({ message: "Price must be a number" })
    .positive("Price must be greater than zero")
    .max(99999999.99, "Price is too large"),
  stock_quantity: z
    .number({ message: "Stock must be a number" })
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .default(0),
  sku: z
    .string({ message: "SKU is required and must be text" })
    .trim()
    .min(1, "SKU is required")
    .max(50, "SKU must be at most 50 characters")
});

const updateProductSchema = createProductSchema.extend({
  is_active: z.boolean({ message: "is_active must be true or false" }).default(true)
});

module.exports = { createProductSchema, updateProductSchema };