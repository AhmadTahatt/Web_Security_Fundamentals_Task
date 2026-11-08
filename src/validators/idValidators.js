const { z } = require("zod");

const idParamSchema = z.object({
  id: z.string().regex(/^[1-9]\d{0,9}$/, "ID must be a positive whole number")
});

module.exports = { idParamSchema };