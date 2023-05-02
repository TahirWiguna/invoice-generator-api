const express = require("express")
const router = express.Router()

const authMiddleware = require("../middleware/auth.middleware")
const mainController = require("../controllers/auth/users.controller")

router.get("/user/findAll", authMiddleware, mainController.findAll)
router.get("/user/findById/:id", authMiddleware, mainController.findById)
router.post("/user/datatable", authMiddleware, mainController.datatable)

router.post("/user/create", authMiddleware, mainController.create)
router.put("/user/edit/:id", authMiddleware, mainController.update)
router.delete("/user/delete/:id", authMiddleware, mainController.delete)

router.put("/user/activate/:id", authMiddleware, mainController.activate)
router.put("/user/deactivate/:id", authMiddleware, mainController.deactivate)

module.exports = router
