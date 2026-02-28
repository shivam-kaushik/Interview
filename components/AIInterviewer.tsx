import { motion } from "framer-motion";

interface AIInterviewerProps {
  interviewer: string;
  currentQuestion: string;
  isSpeaking: boolean;
  isProcessing: boolean;
}

export default function AIInterviewer({
  interviewer,
  currentQuestion,
  isSpeaking,
  isProcessing,
}: AIInterviewerProps) {
  return (
    <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
      <div className="flex items-start space-x-4">
        {/* Interviewer avatar */}
        <div className="relative flex-shrink-0">
          <div className={`w-16 h-16 rounded-full overflow-hidden bg-gray-800 ring-2 ${
            isSpeaking ? 'ring-blue-500 ring-offset-2 ring-offset-[#1a1a1a]' : 'ring-gray-700'
          }`}>
            <img
              src={`/placeholders/${interviewer}.webp`}
              alt={interviewer}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Speaking indicator */}
          {isSpeaking && (
            <motion.div
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
              </svg>
            </motion.div>
          )}
          {/* Processing indicator */}
          {isProcessing && !isSpeaking && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
              <motion.div
                className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          )}
        </div>

        {/* Question/Speech bubble */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-2">
            <span className="font-semibold text-white">{interviewer}</span>
            <span className="ml-2 text-xs text-gray-500 px-2 py-0.5 bg-gray-800 rounded">Interviewer</span>
          </div>
          <div className="bg-[#252525] rounded-xl rounded-tl-sm p-4 border border-gray-700">
            {isProcessing && !currentQuestion ? (
              <div className="flex items-center space-x-2">
                <motion.div
                  className="flex space-x-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-gray-500 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </motion.div>
                <span className="text-sm text-gray-500">Thinking...</span>
              </div>
            ) : (
              <p className="text-gray-200 leading-relaxed">
                {currentQuestion || "Preparing your interview..."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Voice wave animation when speaking */}
      {isSpeaking && (
        <div className="mt-4 flex items-center justify-center space-x-0.5">
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-blue-500 rounded-full"
              animate={{
                height: [4, Math.random() * 20 + 8, 4],
              }}
              transition={{
                duration: 0.4,
                repeat: Infinity,
                delay: i * 0.02,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
