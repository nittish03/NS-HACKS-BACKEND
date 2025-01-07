const express = require("express");

const path = require("path");
const multer = require("multer");
const cors = require("cors");
const bodyParser = require("body-parser");
const colors = require("colors");
const dotenv = require("dotenv");
dotenv.config();











const app = express();
const PORT = process.env.PORT || 8000;
// const upload = multer({dest:"uploads/"})

app.set("view engine", "ejs");
app.set("views",path.resolve("./views"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())




const storage = multer.diskStorage({
  destination:function(req,file,cb){
    return cb(null,'./uploads')
  },
  filename:function(req,file,cb){
    return cb(null,`${Date.now()}-${file.originalname}`)
  }
});

const upload = multer({storage})



app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded." });
  }
  console.log("Uploaded file:", req.file);
  return res.status(200).json({ success: true, message: "File uploaded successfully!" });
});




//listen server
app.listen(PORT, () => {
  console.log(
    `Server Running in ${process.env.DEV_MODE} mode on port no ${PORT}`.bgCyan
      .white
  );
  console.log();
});




