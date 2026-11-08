const express = require("express");
const {
  getUsers,
  getUserById,
  updateUserStatus
} = require("../controllers/usersController");
const validate = require("../middleware/validate");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const { audit } = require("../utils/logger");
const { idParamSchema } = require("../validators/idValidators");
const { updateStatusSchema } = require("../validators/userValidators");

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("admin"), getUsers);
router.get("/:id", validate(idParamSchema, "params"), getUserById);
router.patch("/:id/status", authorize("admin"), validate(idParamSchema, "params"), validate(updateStatusSchema), audit("USER_STATUS_CHANGED"), updateUserStatus);

module.exports = router;