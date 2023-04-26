const express = require("express")
const router = express.Router()

const mainController = require("../controllers/auth.controller")

router.post("/register", mainController.create)

module.exports = router
