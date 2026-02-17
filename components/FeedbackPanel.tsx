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
    if (score >= 8) return "text-green-600 bg-green-100";
    if (score >= 6) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-[#407BBF]"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[#1E2B3A]">Feedback on Your Answer</h3>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(
              feedback.score
            )}`}
          >
            {feedback.score}/10
          </span>
        </div>

        <div className="space-y-3">
          {/* Strengths */}
          {feedback.strengths.length > 0 && (
            <div>
              <div className="flex items-center text-green-600 mb-1">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">Strengths</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 ml-5">
                {feedback.strengths.map((strength, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {strength}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas for improvement */}
          {feedback.improvements.length > 0 && (
            <div>
              <div className="flex items-center text-amber-600 mb-1">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-sm font-medium">Areas to Improve</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 ml-5">
                {feedback.improvements.map((improvement, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    {improvement}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
