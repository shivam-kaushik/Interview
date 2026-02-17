import { useState, useCallback } from "react";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: number;
}

export interface Feedback {
  strengths: string[];
  improvements: string[];
  score: number;
}

interface ConversationState {
  messages: Message[];
  currentQuestion: string;
  feedback: Feedback | null;
  isProcessing: boolean;
  error: string | null;
}

interface UseConversationOptions {
  jobDescription: string;
  resumeText: string;
  interviewer: string;
  interviewType: string;
}

interface UseConversationReturn extends ConversationState {
  sendMessage: (userMessage: string) => Promise<{ response: string; feedback: Feedback | null }>;
  startInterview: () => Promise<string>;
  reset: () => void;
}

export function useConversation({
  jobDescription,
  resumeText,
  interviewer,
  interviewType,
}: UseConversationOptions): UseConversationReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startInterview = useCallback(async (): Promise<string> => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [],
          userResponse: "",
          jobDescription,
          resumeText,
          interviewer,
          interviewType,
          isStart: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start interview");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullResponse += decoder.decode(value);
        }
      }

      // Parse the response
      const parsed = JSON.parse(fullResponse);
      const aiMessage = parsed.response;

      setMessages([{ role: "assistant", content: aiMessage, timestamp: Date.now() }]);
      setCurrentQuestion(aiMessage);

      return aiMessage;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to start interview";
      setError(errorMessage);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [jobDescription, resumeText, interviewer, interviewType]);

  const sendMessage = useCallback(
    async (userMessage: string): Promise<{ response: string; feedback: Feedback | null }> => {
      setIsProcessing(true);
      setError(null);

      const userMsg: Message = { role: "user", content: userMessage, timestamp: Date.now() };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);

      try {
        const response = await fetch("/api/conversation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: updatedMessages,
            userResponse: userMessage,
            jobDescription,
            resumeText,
            interviewer,
            interviewType,
            isStart: false,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            fullResponse += decoder.decode(value);
          }
        }

        // Parse the response
        const parsed = JSON.parse(fullResponse);
        const aiResponse = parsed.response;
        const feedbackData = parsed.feedback;

        const assistantMsg: Message = {
          role: "assistant",
          content: aiResponse,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setCurrentQuestion(aiResponse);

        if (feedbackData) {
          setFeedback(feedbackData);
        }

        return { response: aiResponse, feedback: feedbackData };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to get response";
        setError(errorMessage);
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [messages, jobDescription, resumeText, interviewer, interviewType]
  );

  const reset = useCallback(() => {
    setMessages([]);
    setCurrentQuestion("");
    setFeedback(null);
    setError(null);
    setIsProcessing(false);
  }, []);

  return {
    messages,
    currentQuestion,
    feedback,
    isProcessing,
    error,
    sendMessage,
    startInterview,
    reset,
  };
}
