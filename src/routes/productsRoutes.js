const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deactivateProduct
} = require("../controllers/productsController");
const validate = require("../middleware/validate");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const { audit } = require("../utils/logger");
const { idParamSchema } = require("../validators/idValidators");
const { createProductSchema, updateProductSchema } = require("../validators/productValidators");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", validate(idParamSchema, "params"), getProductById);
router.post("/", authenticate, authorize("admin"), validate(createProductSchema), audit("PRODUCT_CREATED"), createProduct);
router.put("/:id", authenticate, authorize("admin"), validate(idParamSchema, "params"), validate(updateProductSchema), audit("PRODUCT_UPDATED"), updateProduct);
router.patch("/:id/deactivate", authenticate, authorize("admin"), validate(idParamSchema, "params"), audit("PRODUCT_DEACTIVATED"), deactivateProduct);

module.exports = router;