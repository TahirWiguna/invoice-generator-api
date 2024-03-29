const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const mainController = require("../controllers/invoice.controller");

router.post("/invoice/generate", authMiddleware, mainController.generate);

module.exports = router;
