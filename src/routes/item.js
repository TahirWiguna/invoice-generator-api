const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const mainController = require("../controllers/item.controller");

router.get("/item/findAll", authMiddleware, mainController.findAll);
router.get("/item/findById/:id", authMiddleware, mainController.findById);
router.post("/item/datatable", authMiddleware, mainController.datatable);

router.post("/item/create", authMiddleware, mainController.create);
router.put("/item/edit/:id", authMiddleware, mainController.update);
router.delete("/item/delete/:id", authMiddleware, mainController.delete);

module.exports = router;
