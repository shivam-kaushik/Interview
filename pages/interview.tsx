import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import InterviewSetup from "../components/InterviewSetup";
import InterviewRoom from "../components/InterviewRoom";

interface InterviewConfig {
  jobDescription: string;
  resumeText: string;
  interviewer: string;
  interviewType: string;
}

export default function InterviewPage() {
  const [phase, setPhase] = useState<"setup" | "interview" | "complete">("setup");
  const [config, setConfig] = useState<InterviewConfig | null>(null);

  const handleSetupComplete = (data: InterviewConfig) => {
    setConfig(data);
    setPhase("interview");
  };

  const handleInterviewEnd = () => {
    setPhase("complete");
  };

  const handleRestart = () => {
    setConfig(null);
    setPhase("setup");
  };

  return (
    <>
      <Head>
        <title>AI Mock Interview</title>
        <meta name="description" content="Real-time AI-powered mock interview" />
      </Head>

      {phase === "setup" && (
        <InterviewSetup onComplete={handleSetupComplete} />
      )}

      {phase === "interview" && config && (
        <InterviewRoom
          jobDescription={config.jobDescription}
          resumeText={config.resumeText}
          interviewer={config.interviewer}
          interviewType={config.interviewType}
          onEnd={handleInterviewEnd}
        />
      )}

      {phase === "complete" && (
        <div className="min-h-screen bg-[#F2F3F5] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#1E2B3A] mb-2">
              Interview Complete!
            </h1>
            <p className="text-gray-600 mb-8">
              Great job completing your mock interview. Practice makes perfect!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleRestart}
                className="px-6 py-3 bg-[#407BBF] text-white rounded-full font-medium hover:bg-[#3569a3]"
              >
                Start New Interview
              </button>
              <Link
                href="/"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
