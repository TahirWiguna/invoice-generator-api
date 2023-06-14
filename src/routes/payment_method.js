const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const mainController = require("../controllers/master_payment_method.controller");

router.get("/payment_method/findAll", authMiddleware, mainController.findAll);
router.get(
  "/payment_method/findById/:id",
  authMiddleware,
  mainController.findById
);
router.post(
  "/payment_method/datatable",
  authMiddleware,
  mainController.datatable
);

router.post("/payment_method/create", authMiddleware, mainController.create);
router.put("/payment_method/edit/:id", authMiddleware, mainController.update);
router.delete(
  "/payment_method/delete/:id",
  authMiddleware,
  mainController.delete
);

module.exports = router;
