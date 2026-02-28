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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h3 className="font-semibold text-white">Transcript</h3>
        {isListening && (
          <div className="flex items-center text-sm text-green-400">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Listening...
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 && !liveTranscript && (
          <p className="text-gray-500 text-sm italic text-center py-8">
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
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-[#1a1a1a] text-gray-200 rounded-bl-sm border border-gray-700"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex items-center mb-1">
                  <span className="text-xs text-gray-400">Interviewer</span>
                </div>
              )}
              <p className="text-sm leading-relaxed">{message.content}</p>
              {message.timestamp && (
                <p className={`text-xs mt-1 ${message.role === "user" ? "text-blue-200" : "text-gray-500"}`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </motion.div>
        ))}

        {/* Live transcript (interim results) */}
        {liveTranscript.trim() && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-end"
          >
            <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-blue-600/50 text-white rounded-br-sm border border-blue-500/50">
              <p className="text-sm leading-relaxed">{liveTranscript}</p>
              <p className="text-xs text-blue-300 mt-1">Speaking...</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
