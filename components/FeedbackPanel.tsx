import { motion, AnimatePresence } from "framer-motion";

interface Feedback {
  strengths: string[];
  improvements: string[];
  score: number;
}

interface FeedbackPanelProps {
  feedback: Feedback | null;
  isVisible: boolean;
}

export default function FeedbackPanel({ feedback, isVisible }: FeedbackPanelProps) {
  if (!isVisible || !feedback) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-400 border-green-500 bg-green-500/10";
    if (score >= 6) return "text-yellow-400 border-yellow-500 bg-yellow-500/10";
    if (score >= 4) return "text-orange-400 border-orange-500 bg-orange-500/10";
    return "text-red-400 border-red-500 bg-red-500/10";
  };

  const getScoreMessage = (score: number) => {
    if (score >= 8) return "Excellent answer!";
    if (score >= 6) return "Good response";
    if (score >= 4) return "Needs improvement";
    return "Try to be more specific";
  };

  const scorePercentage = (feedback.score / 10) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800"
      >
        {/* Header with score */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white text-sm">Quick Feedback</h3>
            <p className="text-xs text-gray-500">{getScoreMessage(feedback.score)}</p>
          </div>
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${getScoreColor(feedback.score)}`}>
            <span className="text-lg font-bold">{feedback.score}</span>
            <span className="text-xs opacity-70">/10</span>
          </div>
        </div>

        {/* Score bar */}
        <div className="mb-4">
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${scorePercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`h-full rounded-full ${
                feedback.score >= 8 ? "bg-green-500" :
                feedback.score >= 6 ? "bg-yellow-500" :
                feedback.score >= 4 ? "bg-orange-500" : "bg-red-500"
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Strengths */}
          <div>
            <div className="flex items-center text-green-400 mb-2">
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs font-medium uppercase tracking-wide">Strengths</span>
            </div>
            {feedback.strengths.length > 0 ? (
              <ul className="space-y-1.5">
                {feedback.strengths.map((strength, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-xs text-gray-300 flex items-start"
                  >
                    <span className="text-green-500 mr-1.5 mt-0.5">•</span>
                    {strength}
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500 italic">No specific strengths noted</p>
            )}
          </div>

          {/* Improvements */}
          <div>
            <div className="flex items-center text-yellow-400 mb-2">
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="text-xs font-medium uppercase tracking-wide">Improve</span>
            </div>
            {feedback.improvements.length > 0 ? (
              <ul className="space-y-1.5">
                {feedback.improvements.map((improvement, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="text-xs text-gray-300 flex items-start"
                  >
                    <span className="text-yellow-500 mr-1.5 mt-0.5">•</span>
                    {improvement}
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500 italic">Keep up the good work!</p>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
