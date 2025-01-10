

const connectDB = require("./config/db.js")
const express = require("express")
const app = express();
const cors = require("cors");
const multer = require("multer");
app.use(express.json());
app.use(cors());
app.use("/uploads",express.static("uploads"))
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");



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
app.post("/delete-upload", async (req, res) => {
  const idToDelete = req.body.pdf;

  try {
    // Find the document in the database to get the file name
    const pdfRecord = await PdfSchema.findById(idToDelete);

    if (!pdfRecord) {
      return res.status(404).json({ status: "error", message: "File not found in the database." });
    }

    // Get the file path
    const filePath = path.join(__dirname, "uploads", pdfRecord.pdf);

    // Delete the file from the filesystem
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file from uploads folder:", err);
        return res.status(500).json({ status: "error", message: "Failed to delete file from server." });
      }

      // Delete the document from the database
      PdfSchema.deleteOne({ _id: idToDelete })
        .then(() => {
          console.log("File and database record deleted successfully.");
          res.send({ status: "ok", message: "File deleted successfully." });
        })
        .catch((dbErr) => {
          console.error("Error deleting document from database:", dbErr);
          res.status(500).send({ status: "error", message: "Error deleting file from database." });
        });
    });
  } catch (error) {
    console.error("Error handling delete-upload request:", error);
    res.status(500).send({ status: "error", message: "Error deleting file." });
  }
});

app.get("/get-uploads",async(req,res)=>{
  try{
PdfSchema.find({}).then((data)=>{
  res.send({status:"ok",data:data})
});
  }catch(e){
console.log(e)
  }
})


const documentAi = require("./documentAi.js");
app.post("/document",async(req,res)=>{
  const response = await documentAi("./uploads/1736515617958-WhatsApp Image 2025-01-10 at 17.35.49_5cad9f95.jpg").then((result) => {
    		fs.writeFile(
    			"./output.txt",
    			`${result}\n\n\t\t\t- - Document AI extraction output - - \n`
    		);
    	})
    	.catch((error) => {
    		console.log("error occured while extracting via document AI... :", error);
    	});
      res.status(200).json({ success: true, message: "File uploaded successfully!" });
})



//listen server
app.listen(PORT, () => {
  console.log(
    `Server Running in ${process.env.DEV_MODE} mode on port no ${PORT}`.bgCyan
      .white
  );

  console.log();
});