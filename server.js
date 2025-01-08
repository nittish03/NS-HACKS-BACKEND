

const connectDB = require("./config/db.js")
const express = require("express")
const app = express();
const cors = require("cors");
const multer = require("multer");
app.use(express.json());
app.use(cors());
app.use("/uploads",express.static("uploads"))
const mongoose = require("mongoose");
const PORT = process.env.PORT || 8000;
connectDB();
const storage = multer.diskStorage({
  destination:function(req,file,cb){
    return cb(null,'./uploads')
  },
  filename:function(req,file,cb){
    return cb(null,`${Date.now()}-${file.originalname}`)
  }
});

const upload = multer({storage})





app.get("/",async(req,res)=>{
  res.send("Success");
})

require("./models/pdfSchema.js");
const PdfSchema = mongoose.model("PdfDetails")

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded." });
  }
  const type=(req.file.mimetype.split("/")[1])
  const title = req.body.title;
  const fileName = req.file.filename; // Ensure this field exists in req.file
  try {
    await PdfSchema.create({
      title:title,
      pdf:fileName,
      type:type
    }); 
    
    // Respond with success message
    console.log("success");
    return res.status(200).json({ success: true, message: "File uploaded successfully!" });
  } catch (error) {
    console.error(error);

    // Respond with error message
    return res.status(500).json({ success: false, message: "Failed to upload file.", error });
  }
});
 
app.get("/get-uploads",async(req,res)=>{
  try{
PdfSchema.find({}).then((data)=>{
  res.send({status:"ok",data:data})
});
  }catch(e){

  }
})



//listen server
app.listen(PORT, () => {
  console.log(
    `Server Running in ${process.env.DEV_MODE} mode on port no ${PORT}`.bgCyan
      .white
  );

  console.log();
});