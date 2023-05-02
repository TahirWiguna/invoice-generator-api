const express = require("express")
const router = express.Router()

const authMiddleware = require("../middleware/auth.middleware")
const mainController = require("../controllers/auth/roles_permission.controller")

router.get("/role_permission/findAll", authMiddleware, mainController.findAll)
router.get(
  "/role_permission/findById/:id",
  authMiddleware,
  mainController.findById
)
router.post(
  "/role_permission/datatable",
  authMiddleware,
  mainController.datatable
)

router.post("/role_permission/create", authMiddleware, mainController.create)
router.put("/role_permission/edit/:id", authMiddleware, mainController.update)
router.delete(
  "/role_permission/delete/:id",
  authMiddleware,
  mainController.delete
)

module.exports = router
