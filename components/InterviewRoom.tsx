import { useState, useEffect, useCallback, useRef } from "react";
import Webcam from "react-webcam";
import AIInterviewer from "./AIInterviewer";
import TranscriptPanel from "./TranscriptPanel";
import FeedbackPanel from "./FeedbackPanel";
import InterviewControls from "./InterviewControls";
import InterviewSummary from "./InterviewSummary";
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

export interface QuestionFeedback {
  question: string;
  answer: string;
  feedback: Feedback;
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
  const [showSummary, setShowSummary] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null);
  const [allFeedback, setAllFeedback] = useState<QuestionFeedback[]>([]);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const processingRef = useRef(false);
  const lastSpeechTimeRef = useRef(Date.now());
  const silenceCheckRef = useRef<NodeJS.Timeout | null>(null);
  const hasSpokenRef = useRef(false);

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

  const { isPlaying: isSpeaking, playFromText, stop: stopAudio } = useAudioPlayer();

  const {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    silenceThreshold: 2000,
  });

  // Track when user is speaking based on transcript changes
  useEffect(() => {
    if (transcript || interimTranscript) {
      setIsUserSpeaking(true);
      hasSpokenRef.current = true;
      lastSpeechTimeRef.current = Date.now();

      // If AI is speaking and user starts talking, interrupt
      if (isSpeaking) {
        stopAudio();
      }
    }
  }, [transcript, interimTranscript, isSpeaking, stopAudio]);

  // Process user response
  const processUserResponse = useCallback(async () => {
    if (processingRef.current || !transcript.trim() || isProcessing) {
      return;
    }

    processingRef.current = true;
    setIsUserSpeaking(false);
    hasSpokenRef.current = false;
    stopListening();

    const userResponse = transcript.trim();
    const currentQ = currentQuestion;
    resetTranscript();

    try {
      const { response, feedback } = await sendMessage(userResponse);

      if (feedback) {
        setCurrentFeedback(feedback);
        setAllFeedback((prev) => [...prev, {
          question: currentQ,
          answer: userResponse,
          feedback,
        }]);
      }

      // Speak the AI's response
      await playFromText(response, "nova");
    } catch (error) {
      console.error("Failed to process response:", error);
    } finally {
      processingRef.current = false;
    }
  }, [transcript, currentQuestion, isProcessing, sendMessage, playFromText, stopListening, resetTranscript]);

  // Smart silence detection - like Gemini Live / ChatGPT
  useEffect(() => {
    if (!isStarted || isPaused || isProcessing || isSpeaking || processingRef.current) {
      if (silenceCheckRef.current) {
        clearInterval(silenceCheckRef.current);
        silenceCheckRef.current = null;
      }
      return;
    }

    const checkSilence = () => {
      const now = Date.now();
      const timeSinceLastSpeech = now - lastSpeechTimeRef.current;
      const hasContent = transcript.trim().length > 0;

      // If user has spoken and been silent for 2+ seconds, process
      if (hasContent && hasSpokenRef.current && timeSinceLastSpeech >= 2000 && !processingRef.current) {
        setIsUserSpeaking(false);
        processUserResponse();
      } else if (timeSinceLastSpeech >= 500) {
        // Mark as not actively speaking after 0.5s
        setIsUserSpeaking(false);
      }
    };

    silenceCheckRef.current = setInterval(checkSilence, 300);

    return () => {
      if (silenceCheckRef.current) {
        clearInterval(silenceCheckRef.current);
      }
    };
  }, [isStarted, isPaused, isProcessing, isSpeaking, transcript, processUserResponse]);

  // Start the interview when component mounts
  useEffect(() => {
    const initInterview = async () => {
      try {
        const firstQuestion = await startInterview();
        setIsStarted(true);
        await playFromText(firstQuestion, "nova");
        startListening();
        lastSpeechTimeRef.current = Date.now();
      } catch (error) {
        console.error("Failed to start interview:", error);
      }
    };

    initInterview();

    return () => {
      if (silenceCheckRef.current) {
        clearInterval(silenceCheckRef.current);
      }
    };
  }, []);

  // Auto-start listening when AI stops speaking
  useEffect(() => {
    if (isStarted && !isSpeaking && !isProcessing && !isPaused && !isListening && !processingRef.current) {
      startListening();
      lastSpeechTimeRef.current = Date.now();
    }
  }, [isSpeaking, isStarted, isProcessing, isPaused, isListening, startListening]);

  const handlePause = () => {
    if (isPaused) {
      setIsPaused(false);
      if (!isSpeaking && !isProcessing) {
        startListening();
        lastSpeechTimeRef.current = Date.now();
      }
    } else {
      setIsPaused(true);
      stopListening();
      stopAudio();
    }
  };

  const handleEnd = () => {
    stopListening();
    stopAudio();
    if (allFeedback.length > 0) {
      setShowSummary(true);
    } else {
      onEnd();
    }
  };

  const videoConstraints = {
    width: 320,
    height: 240,
    facingMode: "user",
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
        <div className="bg-[#1a1a1a] rounded-xl shadow-lg p-8 max-w-md text-center border border-gray-800">
          <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">
            Speech Recognition Not Supported
          </h2>
          <p className="text-gray-400 mb-4">
            Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.
          </p>
          <button
            onClick={onEnd}
            className="px-6 py-2 bg-white text-black rounded-full font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (showSummary) {
    return (
      <InterviewSummary
        feedbackHistory={allFeedback}
        interviewType={interviewType}
        interviewer={interviewer}
        onRetry={() => {
          setShowSummary(false);
          setAllFeedback([]);
          setCurrentFeedback(null);
          resetTranscript();
          processingRef.current = false;
          startInterview().then((q) => {
            playFromText(q, "nova");
            startListening();
            lastSpeechTimeRef.current = Date.now();
          });
        }}
        onExit={onEnd}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold">{interviewType} Interview</h1>
          <span className="text-sm text-gray-500">with {interviewer}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            {allFeedback.length} questions answered
          </span>
          {isListening && !isSpeaking && !isProcessing && (
            <span className="flex items-center text-xs text-green-400">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Listening
            </span>
          )}
          {isProcessing && (
            <span className="flex items-center text-xs text-yellow-400">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
              Processing
            </span>
          )}
        </div>
      </div>

      <div className="flex h-[calc(100vh-57px)]">
        {/* Left Panel - Interview */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          {/* AI Interviewer */}
          <div className="flex-shrink-0 mb-4">
            <AIInterviewer
              interviewer={interviewer}
              currentQuestion={currentQuestion}
              isSpeaking={isSpeaking}
              isProcessing={isProcessing}
            />
          </div>

          {/* User Webcam - Fixed size */}
          <div className="flex-shrink-0 bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-400">You</span>
              <div className="flex items-center space-x-2">
                {isUserSpeaking && (
                  <span className="text-xs text-blue-400 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse"></span>
                    Speaking
                  </span>
                )}
                {isListening && !isUserSpeaking && !isSpeaking && !isProcessing && (
                  <span className="text-xs text-green-400">Ready to listen</span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative w-40 h-30 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  mirrored
                  videoConstraints={videoConstraints}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Voice indicator */}
              <div className="flex-1">
                <div className="flex items-center justify-center space-x-1 h-12">
                  {[...Array(30)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-75 ${
                        isUserSpeaking ? 'bg-blue-500' : isListening ? 'bg-gray-600' : 'bg-gray-800'
                      }`}
                      style={{
                        height: isUserSpeaking
                          ? `${Math.sin(Date.now() / 100 + i) * 12 + 20}px`
                          : '4px',
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {isProcessing
                    ? "Processing your response..."
                    : isSpeaking
                    ? "Interviewer is speaking - you can interrupt anytime"
                    : "Speak naturally - I'll respond when you pause"}
                </p>
              </div>
            </div>
          </div>

          {/* Current response preview */}
          {(transcript || interimTranscript) && (
            <div className="mt-4 bg-[#1a1a1a] rounded-xl p-4 border border-blue-500/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">Your response:</p>
                <span className="text-xs text-blue-400">
                  {isUserSpeaking ? "Speaking..." : "Waiting for pause..."}
                </span>
              </div>
              <p className="text-white">
                {transcript}
                <span className="text-gray-500">{interimTranscript}</span>
              </p>
            </div>
          )}

          {/* Real-time feedback after each answer */}
          {currentFeedback && (
            <div className="mt-4 flex-shrink-0">
              <FeedbackPanel feedback={currentFeedback} isVisible={true} />
            </div>
          )}

          {/* Controls */}
          <div className="mt-auto pt-4">
            <InterviewControls
              isListening={isListening}
              isSpeaking={isSpeaking}
              isProcessing={isProcessing}
              onPause={handlePause}
              onEnd={handleEnd}
              isPaused={isPaused}
            />
          </div>
        </div>

        {/* Right Panel - Full Height Transcript */}
        <div className="w-[400px] border-l border-gray-800 flex flex-col bg-[#0a0a0a]">
          <TranscriptPanel
            messages={messages}
            liveTranscript={transcript + " " + interimTranscript}
            isListening={isListening}
          />
        </div>
      </div>
    </div>
  );
}
