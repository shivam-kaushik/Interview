import { useState, useEffect, useRef, useCallback } from "react";

interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string) => void;
  onSilence?: () => void;
  silenceThreshold?: number; // milliseconds of silence before triggering onSilence
  continuous?: boolean;
}

interface UseSpeechRecognitionReturn {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition({
  onResult,
  onSilence,
  silenceThreshold = 2500,
  continuous = true,
}: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechTimeRef = useRef<number>(Date.now());
  const isListeningRef = useRef(false);
  const onSilenceRef = useRef(onSilence);
  const onResultRef = useRef(onResult);

  // Keep refs updated
  useEffect(() => {
    onSilenceRef.current = onSilence;
    onResultRef.current = onResult;
  }, [onSilence, onResult]);

  // Initialize speech recognition once
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition && !recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";
        let interim = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript((prev) => prev + " " + finalTranscript);
          onResultRef.current?.(finalTranscript);
          lastSpeechTimeRef.current = Date.now();
        }

        setInterimTranscript(interim);

        // Reset silence timer on any speech
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // Start silence detection timer
        if (isListeningRef.current) {
          silenceTimerRef.current = setTimeout(() => {
            if (isListeningRef.current && Date.now() - lastSpeechTimeRef.current >= silenceThreshold) {
              onSilenceRef.current?.();
            }
          }, silenceThreshold);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "aborted") {
          isListeningRef.current = false;
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // Restart if we should still be listening
        if (isListeningRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Already started or other error, ignore
          }
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (recognitionRef.current) {
        isListeningRef.current = false;
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [continuous, silenceThreshold]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListeningRef.current) {
      isListeningRef.current = true;
      setIsListening(true);
      lastSpeechTimeRef.current = Date.now();
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Already started, ignore
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  return {
    transcript: transcript.trim(),
    interimTranscript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
