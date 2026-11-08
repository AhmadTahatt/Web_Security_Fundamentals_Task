const express = require("express");
const { getOrders, getOrderById } = require("../controllers/ordersController");
const validate = require("../middleware/validate");
const authenticate = require("../middleware/authenticate");
const { idParamSchema } = require("../validators/idValidators");

const router = express.Router();

router.use(authenticate);

router.get("/", getOrders);
router.get("/:id", validate(idParamSchema, "params"), getOrderById);

module.exports = router;