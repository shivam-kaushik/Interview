import { useState, useRef } from "react";
import { motion } from "framer-motion";

interface Interviewer {
  id: string;
  name: string;
  description: string;
  level: string;
}

const interviewers: Interviewer[] = [
  { id: "John", name: "John", description: "Software Engineering", level: "L3" },
  { id: "Richard", name: "Richard", description: "Product Management", level: "L5" },
  { id: "Sarah", name: "Sarah", description: "General/HR", level: "L7" },
];

const interviewTypes = [
  { id: "Behavioral", name: "Behavioral", description: "Communication, teamwork, problem-solving" },
  { id: "Technical", name: "Technical", description: "Coding, system design, technical concepts" },
];

interface InterviewSetupProps {
  onComplete: (data: {
    jobDescription: string;
    resumeText: string;
    interviewer: string;
    interviewType: string;
  }) => void;
}

export default function InterviewSetup({ onComplete }: InterviewSetupProps) {
  const [step, setStep] = useState(1);
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [selectedInterviewer, setSelectedInterviewer] = useState(interviewers[0]);
  const [selectedType, setSelectedType] = useState(interviewTypes[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to parse resume");
      }

      const data = await response.json();
      setResumeText(data.text);
      setResumeFileName(file.name);
    } catch (err) {
      setError("Failed to parse resume. Please try again or paste your resume text.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleStart = () => {
    onComplete({
      jobDescription,
      resumeText,
      interviewer: selectedInterviewer.id,
      interviewType: selectedType.id,
    });
  };

  const canProceedStep1 = jobDescription.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1a1a1a] rounded-2xl border border-gray-800 max-w-2xl w-full p-8"
      >
        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  s <= step
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-500"
                }`}
              >
                {s < step ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-20 h-1 mx-2 rounded ${
                    s < step ? "bg-blue-600" : "bg-gray-800"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Job Description */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-2xl font-bold text-white mb-2">
              Job Description
            </h2>
            <p className="text-gray-400 mb-6">
              Paste the job description you're interviewing for. This helps the AI
              ask relevant questions.
            </p>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full h-48 p-4 bg-[#252525] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  canProceedStep1
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-800 text-gray-500 cursor-not-allowed"
                }`}
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Resume Upload */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-2xl font-bold text-white mb-2">
              Your Resume (Optional)
            </h2>
            <p className="text-gray-400 mb-6">
              Upload your resume so the interviewer can reference your experience.
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors bg-[#252525]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleResumeUpload}
                className="hidden"
              />
              {isUploading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-400">Parsing resume...</span>
                </div>
              ) : resumeFileName ? (
                <div>
                  <svg className="w-12 h-12 mx-auto text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-white font-medium">{resumeFileName}</p>
                  <p className="text-sm text-gray-500 mt-1">Click to replace</p>
                </div>
              ) : (
                <div>
                  <svg className="w-12 h-12 mx-auto text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-300">Click to upload PDF, DOCX, or TXT</p>
                  <p className="text-sm text-gray-500 mt-1">Or skip this step</p>
                </div>
              )}
            </div>

            {error && (
              <p className="mt-3 text-red-400 text-sm">{error}</p>
            )}

            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Or paste your resume text:</p>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                className="w-full h-32 p-3 bg-[#252525] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              />
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-full font-medium text-gray-400 hover:bg-gray-800 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-full font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Select Interviewer & Type */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              Interview Settings
            </h2>

            <div className="mb-6">
              <h3 className="font-medium text-gray-300 mb-3">Interview Type</h3>
              <div className="grid grid-cols-2 gap-3">
                {interviewTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedType.id === type.id
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-gray-700 hover:border-gray-600 bg-[#252525]"
                    }`}
                  >
                    <p className="font-medium text-white">{type.name}</p>
                    <p className="text-sm text-gray-400">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-medium text-gray-300 mb-3">Select Interviewer</h3>
              <div className="grid grid-cols-3 gap-3">
                {interviewers.map((interviewer) => (
                  <button
                    key={interviewer.id}
                    onClick={() => setSelectedInterviewer(interviewer)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      selectedInterviewer.id === interviewer.id
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-gray-700 hover:border-gray-600 bg-[#252525]"
                    }`}
                  >
                    <div className={`w-16 h-16 mx-auto mb-2 rounded-full bg-gray-800 overflow-hidden ring-2 ${
                      selectedInterviewer.id === interviewer.id ? 'ring-blue-500' : 'ring-gray-700'
                    }`}>
                      <img
                        src={`/placeholders/${interviewer.id}.webp`}
                        alt={interviewer.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="font-medium text-white">{interviewer.name}</p>
                    <p className="text-xs text-gray-500">{interviewer.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-full font-medium text-gray-400 hover:bg-gray-800 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleStart}
                className="px-8 py-3 rounded-full font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center transition-colors"
              >
                Start Interview
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
