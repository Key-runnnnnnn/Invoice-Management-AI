const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "backend/uploads/" });

const {
  getdata, 
  updatedata,
  deletedata,
  uploadfile,
} = require("../controllers/dataController");


const router = express.Router();

router.get("/getdata", getdata);
router.put("/updatedata/:id", updatedata);
router.delete("/deletedata/:id", deletedata);

router.post("/uploadfile", upload.single("file"), uploadfile);

module.exports = router;
