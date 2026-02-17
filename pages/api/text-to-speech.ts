import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.APP_OPENAI_API_KEY,
});

type Voice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, voice = "nova" }: { text: string; voice?: Voice } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Limit text length to prevent excessive API costs
    const truncatedText = text.slice(0, 4096);

    const mp3Response = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice,
      input: truncatedText,
    });

    // Get the audio as a buffer
    const buffer = Buffer.from(await mp3Response.arrayBuffer());

    // Set appropriate headers
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", buffer.length);

    // Send the audio buffer
    res.status(200).send(buffer);
  } catch (error) {
    console.error("TTS error:", error);
    res.status(500).json({ error: "Failed to generate speech" });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10kb",
    },
  },
};
