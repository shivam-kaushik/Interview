import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.APP_OPENAI_API_KEY,
});

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ConversationRequest {
  messages: Message[];
  userResponse: string;
  jobDescription: string;
  resumeText: string;
  interviewer: string;
  interviewType: string;
  isStart: boolean;
}

const interviewerPersonas: Record<string, string> = {
  John: "You are John, a friendly but thorough Senior Software Engineer with 10 years of experience. You focus on technical depth and problem-solving approaches. You speak in a conversational but professional tone.",
  Richard: "You are Richard, an experienced Product Manager who values clear communication and structured thinking. You focus on behavioral questions and how candidates handle real-world scenarios. You're warm but analytical.",
  Sarah: "You are Sarah, a seasoned Hiring Manager who looks at the big picture. You assess cultural fit, leadership potential, and overall communication skills. You're encouraging but direct.",
};

function buildSystemPrompt(
  interviewer: string,
  interviewType: string,
  jobDescription: string,
  resumeText: string
): string {
  const persona = interviewerPersonas[interviewer] || interviewerPersonas["John"];

  return `${persona}

You are conducting a ${interviewType} interview for the following position:

JOB DESCRIPTION:
${jobDescription || "Software Engineering position"}

CANDIDATE'S RESUME:
${resumeText || "Not provided"}

INTERVIEW INSTRUCTIONS:
1. Ask ONE question at a time - never multiple questions
2. Listen carefully to the candidate's response
3. Ask relevant follow-up questions to dig deeper into their answers
4. After EACH candidate response, provide brief constructive feedback (2-3 sentences max)
5. Be conversational and natural - this should feel like a real interview
6. If the candidate's answer is unclear or incomplete, ask for clarification
7. Mix different types of questions based on the interview type
8. Keep track of the conversation flow and build upon previous answers

RESPONSE FORMAT:
Always respond with a JSON object in this exact format:
{
  "response": "Your spoken response to the candidate (feedback + next question)",
  "feedback": {
    "strengths": ["strength 1", "strength 2"],
    "improvements": ["area to improve 1"],
    "score": 7
  }
}

For the first message (introduction), use this format:
{
  "response": "Your introduction and first question",
  "feedback": null
}

Keep your responses concise and natural - as if you're speaking out loud.`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      messages,
      userResponse,
      jobDescription,
      resumeText,
      interviewer,
      interviewType,
      isStart,
    }: ConversationRequest = req.body;

    const systemPrompt = buildSystemPrompt(
      interviewer,
      interviewType,
      jobDescription,
      resumeText
    );

    const conversationMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
    ];

    if (isStart) {
      // Starting the interview - ask for introduction
      conversationMessages.push({
        role: "user",
        content: "Please introduce yourself briefly and ask your first interview question.",
      });
    } else {
      // Continue conversation
      for (const msg of messages) {
        if (msg.role !== "system") {
          conversationMessages.push({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          });
        }
      }

      if (userResponse) {
        conversationMessages.push({
          role: "user",
          content: userResponse,
        });
      }
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: conversationMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseContent = completion.choices[0]?.message?.content || "";

    // Try to parse as JSON, fallback to plain text
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseContent);
    } catch {
      // If not valid JSON, wrap it
      parsedResponse = {
        response: responseContent,
        feedback: null,
      };
    }

    res.status(200).json(parsedResponse);
  } catch (error) {
    console.error("Conversation error:", error);
    res.status(500).json({ error: "Failed to process conversation" });
  }
}
