

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
const documentAi = require("./documentAi.js")



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
  const filePath = req.file.path


  try {
    const result = await documentAi(filePath);

    const pdf = await PdfSchema.create({
      title:title,
      pdf:fileName,
      type:type,
      result:result
    }); 
    
    // Respond with success message
    console.log("success");
    return res.status(200).json({ success: true, message: "File uploaded successfully!",data:pdf });
  } catch (error) {
    console.error(error);

    // Respond with error message
    return res.status(500).json({ success: false, message: "Failed to upload and documentai file.", error });
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

app.post("/get-single-upload", async (req, res) => {
  try {
    const id = req.body.id; // Extract the id from the request body
    const data = await PdfSchema.findById(id);

    if (!data) {
      return res.status(404).send({ status: "error", message: "Document not found" });
    }

    res.send({ status: "ok", data: data });
  } catch (error) {
    console.error("Error fetching document by ID:", error);
    res.status(500).send({ status: "error", message: "Internal server error" });
  }
});



// app.post(
//   "/documentai",
//   upload.single("bill"), // Handle single file uploads for the field "bill"
//   async (req, res) => {
//     try {
//       if (!req.file) {
//         return res.status(400).send({ error: "No file uploaded" });
//       }

//       const filePath = req.file.path;
//       console.log(filePath);

//       const result = await documentAi(filePath);
//       console.log("result :  ", result);
//       console.log("success")
//       res.send({ status: "ok", data: result });
//     } catch (error) {
//       console.error("Error occurred while extracting via Document AI:", error);
//       res.status(500).send({ error: "Internal server error" });
//     }
//   }
// );


//listen server
app.listen(PORT, () => {
  console.log(
    `Server Running in ${process.env.DEV_MODE} mode on port no ${PORT}`.bgCyan
      .white
  );

  console.log();
});