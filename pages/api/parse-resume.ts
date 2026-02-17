import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, File } from "formidable";
import fs from "fs";

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

async function parseResume(filePath: string, fileType: string): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath);

  if (fileType === "application/pdf" || filePath.endsWith(".pdf")) {
    // Use pdf-parse v1.x for parsing
    const pdf = eval('require')('pdf-parse');
    const data = await pdf(fileBuffer);
    return data.text;
  } else if (
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    filePath.endsWith(".docx")
  ) {
    // For DOCX, we'll extract basic text
    // In production, you'd want to use mammoth or similar
    return "DOCX parsing not fully implemented. Please upload a PDF.";
  } else if (fileType === "text/plain" || filePath.endsWith(".txt")) {
    return fileBuffer.toString("utf-8");
  }

  throw new Error("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = new IncomingForm({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      keepExtensions: true,
    });

    const { fields, files } = await new Promise<{ fields: any; files: any }>(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve({ fields, files });
        });
      }
    );

    const uploadedFile = files.resume;
    if (!uploadedFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file: File = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;
    const filePath = file.filepath;
    const fileType = file.mimetype || "";

    const extractedText = await parseResume(filePath, fileType);

    // Clean up the temp file
    fs.unlinkSync(filePath);

    res.status(200).json({
      text: extractedText,
      filename: file.originalFilename,
    });
  } catch (error) {
    console.error("Resume parsing error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to parse resume",
    });
  }
}
