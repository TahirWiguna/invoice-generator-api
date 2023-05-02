const express = require("express")
const router = express.Router()

const mainController = require("../controllers/auth/auth.controller")
const authMiddleware = require("../middleware/auth.middleware")

router.post("/auth/login", mainController.login)

module.exports = router
