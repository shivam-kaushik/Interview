import { motion } from "framer-motion";

interface InterviewControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  onDoneAnswering: () => void;
  onPause: () => void;
  onEnd: () => void;
  isPaused: boolean;
}

export default function InterviewControls({
  isListening,
  isSpeaking,
  isProcessing,
  onDoneAnswering,
  onPause,
  onEnd,
  isPaused,
}: InterviewControlsProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-center space-x-4">
        {/* Done Answering Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onDoneAnswering}
          disabled={!isListening || isSpeaking || isProcessing}
          className={`flex items-center px-6 py-3 rounded-full font-medium transition-all ${
            isListening && !isSpeaking && !isProcessing
              ? "bg-[#407BBF] text-white hover:bg-[#3569a3]"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          I'm Done Answering
        </motion.button>

        {/* Pause/Resume Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPause}
          className="flex items-center px-4 py-3 rounded-full font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          {isPaused ? (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Resume
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pause
            </>
          )}
        </motion.button>

        {/* End Interview Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onEnd}
          className="flex items-center px-4 py-3 rounded-full font-medium bg-red-50 text-red-600 hover:bg-red-100"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          End Interview
        </motion.button>
      </div>

      {/* Status indicator */}
      <div className="mt-3 text-center">
        {isSpeaking && (
          <span className="text-sm text-[#407BBF] flex items-center justify-center">
            <span className="w-2 h-2 bg-[#407BBF] rounded-full mr-2 animate-pulse"></span>
            Interviewer is speaking...
          </span>
        )}
        {isProcessing && !isSpeaking && (
          <span className="text-sm text-yellow-600 flex items-center justify-center">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
            Processing your response...
          </span>
        )}
        {isListening && !isSpeaking && !isProcessing && (
          <span className="text-sm text-green-600 flex items-center justify-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Listening... Speak your answer
          </span>
        )}
        {isPaused && (
          <span className="text-sm text-gray-500 flex items-center justify-center">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
            Interview paused
          </span>
        )}
      </div>
    </div>
  );
}
