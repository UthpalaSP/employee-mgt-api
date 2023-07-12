const router = require("express").Router();
const employeeController = require("../controllers/employeeController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post("/create", upload.single("file"), employeeController.upload);

router.get("/getall", employeeController.getAll);

module.exports = router;
