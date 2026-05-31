"use client";

import { Mic, Loader2 } from "lucide-react";
import { useState } from "react";

interface Props {
  onTranscript: (text: string) => void | Promise<void>;
}

export function VoiceExpenseButton({ onTranscript }: Props) {
  const [listening, setListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
    setListening(true);

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;

      await onTranscript(transcript);
    };

    recognition.onend = () => {
      setListening(false);
    };
  };

  return (
    <button onClick={startListening} className="flex items-center gap-2">
      {listening ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Mic className="h-4 w-4" />
      )}

      {listening ? "Listening..." : "Voice Expense"}
    </button>
  );
}
