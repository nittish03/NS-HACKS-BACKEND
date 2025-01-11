const mongoose = require('mongoose');

const PdfDetailsSchema = new mongoose.Schema({
    pdf: String,
    title: String,
    type:String,
    result:String,
    password:String,
    dateUploaded: {
        type: String, // Store the date as a string in "YYYY-MM-DD" format
        default: () => {
            const now = new Date();
            return now.toISOString().split('T')[0]; // Extract only the date part
        }
    }
}, {
    collection: "PdfDetails" // Enclose the collection name in quotes
});

mongoose.model("PdfDetails", PdfDetailsSchema);
 