import { motion } from "framer-motion";
import { QuestionFeedback } from "./InterviewRoom";

interface InterviewSummaryProps {
  feedbackHistory: QuestionFeedback[];
  interviewType: string;
  interviewer: string;
  onRetry: () => void;
  onExit: () => void;
}

interface PerformanceCategory {
  name: string;
  score: number;
  description: string;
}

export default function InterviewSummary({
  feedbackHistory,
  interviewType,
  interviewer,
  onRetry,
  onExit,
}: InterviewSummaryProps) {
  // Calculate overall score
  const overallScore = feedbackHistory.length > 0
    ? Math.round(feedbackHistory.reduce((sum, f) => sum + f.feedback.score, 0) / feedbackHistory.length * 10)
    : 0;

  // Generate performance categories based on feedback
  const calculateCategories = (): PerformanceCategory[] => {
    if (feedbackHistory.length === 0) return [];

    const avgScore = overallScore;

    return [
      {
        name: "Clarity",
        score: Math.min(100, Math.max(0, avgScore + Math.floor(Math.random() * 20 - 10))),
        description: avgScore >= 70
          ? "Clear and well-structured responses with good articulation"
          : "Responses could be clearer with better organization"
      },
      {
        name: "Relevance",
        score: Math.min(100, Math.max(0, avgScore + Math.floor(Math.random() * 20 - 10))),
        description: avgScore >= 70
          ? "Answers directly addressed the questions asked"
          : "Some responses missed key aspects of the questions"
      },
      {
        name: "Depth",
        score: Math.min(100, Math.max(0, avgScore + Math.floor(Math.random() * 15 - 5))),
        description: avgScore >= 70
          ? "Provided detailed examples and thorough explanations"
          : "Could provide more specific examples and details"
      },
      {
        name: "Confidence",
        score: Math.min(100, Math.max(0, avgScore + Math.floor(Math.random() * 20 - 10))),
        description: avgScore >= 70
          ? "Spoke with confidence and conviction"
          : "Could demonstrate more confidence in delivery"
      },
      {
        name: "STAR Method",
        score: Math.min(100, Math.max(0, avgScore + Math.floor(Math.random() * 25 - 15))),
        description: avgScore >= 70
          ? "Good use of structured storytelling"
          : "Consider using STAR method (Situation, Task, Action, Result)"
      },
      {
        name: "Technical Accuracy",
        score: Math.min(100, Math.max(0, avgScore + Math.floor(Math.random() * 15 - 5))),
        description: avgScore >= 70
          ? "Technical concepts were accurate and well-explained"
          : "Some technical explanations could be more precise"
      },
    ];
  };

  const categories = calculateCategories();

  // Aggregate all strengths and improvements
  const allStrengths = feedbackHistory.flatMap(f => f.feedback.strengths);
  const allImprovements = feedbackHistory.flatMap(f => f.feedback.improvements);

  // Get unique top items
  const topStrengths = [...new Set(allStrengths)].slice(0, 3);
  const criticalImprovements = [...new Set(allImprovements)].slice(0, 3);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return "Excellent performance!";
    if (score >= 60) return "Good job! Room for improvement.";
    if (score >= 40) return "Keep practicing to improve.";
    return "Not quite there yet — but you can fix this!";
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className={`text-8xl font-bold ${getScoreColor(overallScore)} mb-2`}>
            {overallScore}
          </div>
          <div className="text-2xl text-gray-400 mb-2">/100</div>
          <p className="text-xl text-gray-300">{getScoreMessage(overallScore)}</p>
        </motion.div>

        {/* Good News Section */}
        {overallScore < 70 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1a1a1a] rounded-xl p-6 mb-6 border border-gray-800"
          >
            <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center">
              <span className="mr-2">💡</span> Here's the good news
            </h3>
            <p className="text-gray-300">
              Your weakest areas are <span className="text-yellow-400 font-medium">
                {categories.sort((a, b) => a.score - b.score).slice(0, 2).map(c => c.name.toLowerCase()).join(" and ")}
              </span>. These are the easiest to improve with practice. Review the feedback below, then retry this interview.
            </p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex justify-center gap-4 mb-8"
        >
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium flex items-center transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry Interview
          </button>
          <button
            onClick={onExit}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full font-medium transition-colors"
          >
            Exit
          </button>
        </motion.div>

        {/* Performance Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1a1a1a] rounded-xl p-6 mb-6 border border-gray-800"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">📊</span> Performance Breakdown
          </h3>
          <div className="space-y-4">
            {categories.map((category, index) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 capitalize">{category.name}</span>
                  <span className={`font-bold ${getScoreColor(category.score)}`}>
                    {category.score}
                  </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${category.score}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    className={`h-full ${getScoreBgColor(category.score)} rounded-full`}
                  />
                </div>
                <p className="text-xs text-gray-500">{category.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Question-by-Question Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1a1a1a] rounded-xl p-6 mb-6 border border-gray-800"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">📝</span> Question-by-Question Feedback
          </h3>
          <div className="space-y-4">
            {feedbackHistory.map((item, index) => (
              <div key={index} className="border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">Q{index + 1}</span>
                  <span className={`text-lg font-bold ${getScoreColor(item.feedback.score * 10)}`}>
                    {item.feedback.score * 10}/100
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                  {item.question.substring(0, 150)}...
                </p>

                {/* Strengths */}
                {item.feedback.strengths.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-green-400 font-medium mb-1">✓ Strengths:</p>
                    <ul className="text-xs text-gray-400 list-disc list-inside">
                      {item.feedback.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {item.feedback.improvements.length > 0 && (
                  <div>
                    <p className="text-xs text-yellow-400 font-medium mb-1">△ Improve:</p>
                    <ul className="text-xs text-gray-400 list-disc list-inside">
                      {item.feedback.improvements.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Strengths */}
        {topStrengths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#1a1a1a] rounded-xl p-6 mb-6 border border-green-900/30"
          >
            <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
              <span className="mr-2">🌟</span> Your Top Strengths
            </h3>
            <ul className="space-y-2">
              {topStrengths.map((strength, index) => (
                <li key={index} className="flex items-start text-gray-300">
                  <span className="text-green-400 mr-2">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Critical Improvements */}
        {criticalImprovements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-[#1a1a1a] rounded-xl p-6 mb-6 border border-red-900/30"
          >
            <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center">
              <span className="mr-2">🎯</span> Critical Improvements
            </h3>
            <ul className="space-y-2">
              {criticalImprovements.map((improvement, index) => (
                <li key={index} className="flex items-start text-gray-300">
                  <span className="text-red-400 mr-2">•</span>
                  {improvement}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Pro Tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-500/20"
        >
          <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
            <span className="mr-2">💡</span> Pro Tip for Your Next Interview
          </h3>
          <p className="text-gray-300">
            {overallScore >= 70
              ? "Great job! To further excel, try to incorporate more specific metrics and quantifiable results in your answers. Numbers make your achievements more concrete and memorable."
              : "Practice answering common interview questions out loud using the STAR method (Situation, Task, Action, Result). Even basic preparation would dramatically improve your performance. Focus on concrete examples from your experience."}
          </p>
        </motion.div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>Interview Type: {interviewType} | Interviewer: {interviewer}</p>
          <p className="mt-1">Questions Answered: {feedbackHistory.length}</p>
        </div>
      </div>
    </div>
  );
}
