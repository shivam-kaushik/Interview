import { motion } from "framer-motion";

interface InterviewControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  onPause: () => void;
  onEnd: () => void;
  isPaused: boolean;
}

export default function InterviewControls({
  isListening,
  isSpeaking,
  isProcessing,
  onPause,
  onEnd,
  isPaused,
}: InterviewControlsProps) {
  return (
    <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
      <div className="flex items-center justify-center space-x-4">
        {/* Pause/Resume Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPause}
          className={`flex items-center px-6 py-3 rounded-full font-medium transition-all ${
            isPaused
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-700 text-gray-200 hover:bg-gray-600"
          }`}
        >
          {isPaused ? (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Resume Interview
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
          className="flex items-center px-6 py-3 rounded-full font-medium bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          End Interview
        </motion.button>
      </div>

      {/* Status indicator */}
      <div className="mt-4 flex items-center justify-center">
        {isSpeaking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center text-sm text-blue-400"
          >
            <span className="relative flex h-3 w-3 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            Interviewer is speaking...
          </motion.div>
        )}
        {isProcessing && !isSpeaking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center text-sm text-yellow-400"
          >
            <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing your response...
          </motion.div>
        )}
        {isListening && !isSpeaking && !isProcessing && !isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center text-sm text-green-400"
          >
            <span className="relative flex h-3 w-3 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Listening... I'll respond when you pause
          </motion.div>
        )}
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center text-sm text-gray-400"
          >
            <span className="w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
            Interview paused
          </motion.div>
        )}
      </div>

      {/* Helpful tip */}
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-600">
          Tip: Speak naturally. The AI will automatically detect when you're done and respond.
        </p>
      </div>
    </div>
  );
}
