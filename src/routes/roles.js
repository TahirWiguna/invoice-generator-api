const express = require("express")
const router = express.Router()

const authMiddleware = require("../middleware/auth.middleware")
const mainController = require("../controllers/roles.controller")

router.get("/role/findAll", authMiddleware, mainController.findAll)
router.get("/role/findById/:id", authMiddleware, mainController.findById)

router.post("/role/create", authMiddleware, mainController.create)
router.put("/role/edit/:id", authMiddleware, mainController.update)
router.delete("/role/delete/:id", authMiddleware, mainController.delete)

module.exports = router
