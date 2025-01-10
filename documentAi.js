const {DocumentProcessorServiceClient} = require('@google-cloud/documentai').v1;
  const fs = require('fs').promises;
const dotenv = require("dotenv").config()

const projectId = process.env.PROJECT_ID;
const location = process.env.LOCATION;
const processorId = process.env.PROCESSOR_ID;

async function documentAi(filePath) {

	// fs.unlink("./public/outputs/output1.txt");
	try {

		const credentialsPath = "./gcp-credentials.json";
		fs.writeFile(credentialsPath, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

		// Step 2: Set Environment Variable for Authentication
		process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;

		// Instantiates a client
		const client = new DocumentProcessorServiceClient();
		
		//secret Keys...
		
		// The full resource name of the processor
		const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

		// Read the file into memory.
		const imageFile = await fs.readFile(filePath);

		console.log("imageFile :	", imageFile);

		// Convert the image data to a Buffer and base64 encode it.
		const encodedImage = Buffer.from(imageFile).toString("base64");

		const request = {
			name,
			rawDocument: {
				content: encodedImage,
				mimeType: "image/png",
				// mimeType: {
				// 	".pdf": "application/pdf",
				// 	'.jpg' : 'image/jpeg',
				// 	'.jpeg' : 'image/jpeg',
				// 	'.png' : 'image/png',
				// 	'webp' : 'image/webp',
				// 	'html' : 'text/html'
				// },
			},
		};

		// Recognizes text entities in the PDF document
		const [result] = await client.processDocument(request);
		const { document } = result;

		// Get all of the document text as one big string
		const { text } = document;

		// Extract shards from the text field
		const getText = (textAnchor) => {
			if (!textAnchor.textSegments || textAnchor.textSegments.length === 0) {
				return "";
			}
			// First shard in document doesn't have startIndex property
			const startIndex = textAnchor.textSegments[0].startIndex || 0;
			const endIndex = textAnchor.textSegments[0].endIndex;

			return text.substring(startIndex, endIndex);
		};

		// Read the text recognition output from the processor
		let type = "";
		type += "Text extraction from invoice starts here...\n";
		const [page1] = document.pages;
		const { paragraphs } = page1;

		for (const paragraph of paragraphs) {
			const paragraphText = getText(paragraph.layout.textAnchor);
			type += `${paragraphText}`;
		}
		type += "Text extraction from invoice ends here...";
		fs.writeFile("./output.txt", type);
		console.log("SUCCESS...");
		return type;
	} catch (error) {
		console.log("Error while processing document:");
		throw error;
	}
}

// documentAi("./uploads/1736515617958-WhatsApp Image 2025-01-10 at 17.35.49_5cad9f95.jpg")
// 	.then((result) => {
// 		fs.writeFile(
// 			"./output.txt",
// 			`${result}\n\n\t\t\t- - Document AI extraction output - - \n`
// 		);
// 	})
// 	.catch((error) => {
// 		console.log("error occured while extracting via document AI... :", error);
// 	});

module.exports = documentAi;

