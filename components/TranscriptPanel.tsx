import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

interface TranscriptPanelProps {
  messages: Message[];
  liveTranscript: string;
  isListening: boolean;
}

export default function TranscriptPanel({
  messages,
  liveTranscript,
  isListening,
}: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, liveTranscript]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-[#1E2B3A]">Transcript</h3>
        {isListening && (
          <div className="flex items-center text-sm text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Listening...
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-2"
        style={{ maxHeight: "200px" }}
      >
        {messages.length === 0 && !liveTranscript && (
          <p className="text-gray-400 text-sm italic">
            Your conversation will appear here...
          </p>
        )}

        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-[#407BBF] text-white rounded-br-none"
                  : "bg-[#F2F3F5] text-[#1E2B3A] rounded-bl-none"
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
          </motion.div>
        ))}

        {/* Live transcript (interim results) */}
        {liveTranscript && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-end"
          >
            <div className="max-w-[80%] rounded-lg p-3 bg-[#407BBF]/70 text-white rounded-br-none">
              <p className="text-sm leading-relaxed italic">{liveTranscript}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
