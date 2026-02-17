import { useState, useEffect, useCallback, useRef } from "react";
import Webcam from "react-webcam";
import AIInterviewer from "./AIInterviewer";
import TranscriptPanel from "./TranscriptPanel";
import FeedbackPanel from "./FeedbackPanel";
import InterviewControls from "./InterviewControls";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { useConversation, Feedback } from "../hooks/useConversation";

interface InterviewRoomProps {
  jobDescription: string;
  resumeText: string;
  interviewer: string;
  interviewType: string;
  onEnd: () => void;
}

export default function InterviewRoom({
  jobDescription,
  resumeText,
  interviewer,
  interviewType,
  onEnd,
}: InterviewRoomProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null);
  const [allFeedback, setAllFeedback] = useState<Feedback[]>([]);
  const webcamRef = useRef<Webcam>(null);

  const {
    messages,
    currentQuestion,
    isProcessing,
    sendMessage,
    startInterview,
  } = useConversation({
    jobDescription,
    resumeText,
    interviewer,
    interviewType,
  });

  const { isPlaying: isSpeaking, playFromText } = useAudioPlayer();

  const handleSilence = useCallback(() => {
    // When silence is detected, stop listening and process
    if (transcript.trim() && !isProcessing && !isSpeaking) {
      handleDoneAnswering();
    }
  }, [isProcessing, isSpeaking]);

  const {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    onSilence: handleSilence,
    silenceThreshold: 3000, // 3 seconds of silence
  });

  // Start the interview when component mounts
  useEffect(() => {
    const initInterview = async () => {
      try {
        const firstQuestion = await startInterview();
        setIsStarted(true);
        // Speak the first question
        await playFromText(firstQuestion, "nova");
        // Start listening after AI finishes speaking
        startListening();
      } catch (error) {
        console.error("Failed to start interview:", error);
      }
    };

    initInterview();
  }, []);

  // When AI stops speaking, start listening
  useEffect(() => {
    if (isStarted && !isSpeaking && !isProcessing && !isPaused) {
      startListening();
    }
  }, [isSpeaking, isStarted, isProcessing, isPaused]);

  const handleDoneAnswering = async () => {
    if (!transcript.trim()) return;

    stopListening();
    const userResponse = transcript.trim();
    resetTranscript();

    try {
      const { response, feedback } = await sendMessage(userResponse);

      if (feedback) {
        setCurrentFeedback(feedback);
        setAllFeedback((prev) => [...prev, feedback]);
      }

      // Speak the AI's response
      await playFromText(response, "nova");
    } catch (error) {
      console.error("Failed to process response:", error);
    }
  };

  const handlePause = () => {
    if (isPaused) {
      setIsPaused(false);
      if (!isSpeaking && !isProcessing) {
        startListening();
      }
    } else {
      setIsPaused(true);
      stopListening();
    }
  };

  const handleEnd = () => {
    stopListening();
    onEnd();
  };

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user",
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-[#F2F3F5] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-[#1E2B3A] mb-2">
            Speech Recognition Not Supported
          </h2>
          <p className="text-gray-600 mb-4">
            Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.
          </p>
          <button
            onClick={onEnd}
            className="px-6 py-2 bg-[#1E2B3A] text-white rounded-full"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F3F5] p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-[#1E2B3A]">
            {interviewType} Interview
          </h1>
          <div className="text-sm text-gray-500">
            {messages.filter(m => m.role === "user").length} responses
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left column - AI Interviewer and Webcam */}
          <div className="space-y-4">
            {/* AI Interviewer */}
            <AIInterviewer
              interviewer={interviewer}
              currentQuestion={currentQuestion}
              isSpeaking={isSpeaking}
              isProcessing={isProcessing}
            />

            {/* User Webcam */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">You</span>
                {isListening && (
                  <span className="flex items-center text-xs text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                    Recording
                  </span>
                )}
              </div>
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  mirrored
                  videoConstraints={videoConstraints}
                  className="w-full h-full object-cover"
                />
                {/* Voice activity indicator */}
                {isListening && (
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-green-400 rounded-full animate-pulse"
                        style={{
                          height: `${Math.random() * 16 + 8}px`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column - Transcript and Feedback */}
          <div className="space-y-4">
            {/* Transcript */}
            <TranscriptPanel
              messages={messages}
              liveTranscript={transcript + " " + interimTranscript}
              isListening={isListening}
            />

            {/* Feedback */}
            <FeedbackPanel
              feedback={currentFeedback}
              isVisible={!!currentFeedback}
            />

            {/* Controls */}
            <InterviewControls
              isListening={isListening}
              isSpeaking={isSpeaking}
              isProcessing={isProcessing}
              onDoneAnswering={handleDoneAnswering}
              onPause={handlePause}
              onEnd={handleEnd}
              isPaused={isPaused}
            />
          </div>
        </div>

        {/* Overall progress */}
        {allFeedback.length > 0 && (
          <div className="mt-4 bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                Average Score
              </span>
              <span className="text-lg font-bold text-[#407BBF]">
                {(allFeedback.reduce((sum, f) => sum + f.score, 0) / allFeedback.length).toFixed(1)}/10
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
