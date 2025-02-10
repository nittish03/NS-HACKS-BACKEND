const { DocumentProcessorServiceClient } = require("@google-cloud/documentai").v1;
const fs = require("fs").promises;
const dotenv = require("dotenv").config();

const projectId = process.env.PROJECT_ID;
const location = process.env.LOCATION;
const processorId = process.env.PROCESSOR_ID;
const credentialsPath = "./gcp-credentials.json";

/**
 * Ensures the GCP credentials file exists.
 */
async function ensureCredentialsFile() {
    try {
        await fs.access(credentialsPath);
        console.log("✅ Credentials file already exists.");
    } catch (error) {
        console.log("🔹 Creating credentials file...");
        if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
            throw new Error("❌ GOOGLE_APPLICATION_CREDENTIALS_JSON is missing in environment variables.");
        }
        await fs.writeFile(credentialsPath, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    }
}

/**
 * Processes a document using Google Cloud Document AI.
 * @param {string} filePath - Path to the file to be processed.
 * @param {string} type - File type (pdf, jpg, png, etc.).
 * @returns {Promise<string>} Extracted text from the document.
 */
async function documentAi(filePath, type) {
    try {
        // Ensure credentials are set up
        await ensureCredentialsFile();
        process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;

        // Instantiate a client
        const client = new DocumentProcessorServiceClient();

        // Define processor resource name
        const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

        // Read the file into memory
        const imageFile = await fs.readFile(filePath);
        console.log("📄 File read successfully.");

        // Convert image data to base64
        const encodedImage = Buffer.from(imageFile).toString("base64");

        // Supported MIME types
        const mimeTypeMap = {
            pdf: "application/pdf",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            webp: "image/webp",
            html: "text/html",
        };

        const fileMimeType = mimeTypeMap[type.toLowerCase()];
        if (!fileMimeType) throw new Error(`❌ Unsupported file type: ${type}`);

        // Prepare API request
        const request = {
            name,
            rawDocument: { content: encodedImage, mimeType: fileMimeType },
        };

        console.log("🔄 Sending request to Document AI...");
        const [result] = await client.processDocument(request);
        const { document } = result;

        // Extract text from document
        const { text } = document;

        console.log("✅ Text extraction successful.");
        return text;
    } catch (error) {
        console.error("❌ Error while processing document:", error);
        throw error;
    }
}

// Example Usage
// documentAi("./uploads/sample.jpg", "jpg")
//     .then((result) => {
//         return fs.writeFile("./output.txt", `${result}\n\n\t- - Document AI Extraction Output - -\n`);
//     })
//     .then(() => console.log("✅ Output saved to output.txt"))
//     .catch((error) => console.log("❌ Error:", error));

module.exports = documentAi;
