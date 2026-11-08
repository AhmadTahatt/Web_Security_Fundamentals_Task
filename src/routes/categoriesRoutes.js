const express = require("express");
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory
} = require("../controllers/categoriesController");
const validate = require("../middleware/validate");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const { audit } = require("../utils/logger");
const { idParamSchema } = require("../validators/idValidators");
const { createCategorySchema, updateCategorySchema } = require("../validators/categoryValidators");

const router = express.Router();

router.get("/", getCategories);
router.get("/:id", validate(idParamSchema, "params"), getCategoryById);
router.post("/", authenticate, authorize("admin"), validate(createCategorySchema), audit("CATEGORY_CREATED"), createCategory);
router.put("/:id", authenticate, authorize("admin"), validate(idParamSchema, "params"), validate(updateCategorySchema), audit("CATEGORY_UPDATED"), updateCategory);

module.exports = router;