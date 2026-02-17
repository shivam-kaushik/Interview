import { useState, useRef, useCallback } from "react";

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  isLoading: boolean;
  play: (audioUrl: string) => Promise<void>;
  playFromText: (text: string, voice?: string) => Promise<void>;
  stop: () => void;
  error: string | null;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const play = useCallback(async (audioUrl: string) => {
    try {
      setError(null);
      setIsLoading(true);

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      audioRef.current = new Audio(audioUrl);

      audioRef.current.onended = () => {
        setIsPlaying(false);
      };

      audioRef.current.onerror = () => {
        setError("Failed to play audio");
        setIsPlaying(false);
      };

      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      setError("Failed to play audio");
      console.error("Audio playback error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const playFromText = useCallback(async (text: string, voice: string = "alloy") => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, voice }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate speech");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      audioRef.current = new Audio(audioUrl);

      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      audioRef.current.onerror = () => {
        setError("Failed to play audio");
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      setError("Failed to generate or play speech");
      console.error("TTS error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isPlaying,
    isLoading,
    play,
    playFromText,
    stop,
    error,
  };
}
