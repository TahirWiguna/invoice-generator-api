const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const mainController = require("../controllers/client.controller");

router.get("/client/findAll", authMiddleware, mainController.findAll);
router.get("/client/findById/:id", authMiddleware, mainController.findById);
router.post("/client/datatable", authMiddleware, mainController.datatable);

router.post("/client/create", authMiddleware, mainController.create);
router.put("/client/edit/:id", authMiddleware, mainController.update);
router.delete("/client/delete/:id", authMiddleware, mainController.delete);

module.exports = router;
