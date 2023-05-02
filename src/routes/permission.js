const express = require("express")
const router = express.Router()

const authMiddleware = require("../middleware/auth.middleware")
const mainController = require("../controllers/auth/permission.controller")

router.get("/permission/findAll", authMiddleware, mainController.findAll)
router.get("/permission/findById/:id", authMiddleware, mainController.findById)
router.post("/permission/datatable", authMiddleware, mainController.datatable)

router.post("/permission/create", authMiddleware, mainController.create)
router.post(
  "/permission/createTemplate",
  authMiddleware,
  mainController.createTemplate
)
router.put("/permission/edit/:id", authMiddleware, mainController.update)
router.delete("/permission/delete/:id", authMiddleware, mainController.delete)
router.delete(
  "/permission/deleteModule",
  authMiddleware,
  mainController.deleteModule
)

module.exports = router
