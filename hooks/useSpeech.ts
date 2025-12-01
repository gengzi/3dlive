import { useState, useCallback, useEffect, useRef } from 'react';

export const useSpeech = ({ language }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [hasRecognitionSupport, setHasRecognitionSupport] = useState(false);

  // Refs to hold instances
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Map our language codes to Web Speech API lang codes
  const getSpeechLangCode = (lang) => {
    switch (lang) {
      case 'zh': return 'zh-CN';
      case 'en': return 'en-US';
      default: return 'zh-CN';
    }
  };

  useEffect(() => {
    // FIX: Add type assertion for browser-specific SpeechRecognition API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setHasRecognitionSupport(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = getSpeechLangCode(language); // Set language dynamically

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setHasRecognitionSupport(false);
      console.warn("Speech Recognition API not supported in this browser.");
    }

    // Cleanup existing recognition instance if language changes
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, [language]); // Re-initialize recognition when language changes

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Failed to start recognition", e);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const speak = useCallback((text) => {
    if (!synthRef.current) return;

    // Cancel current speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getSpeechLangCode(language); // Set language dynamically
    utterance.rate = 1.1; // Slightly faster for a "cute" feel
    utterance.pitch = 1.2; // Slightly higher pitch

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  }, [language]); // Re-create speak function if language changes

  const cancelSpeech = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    speak,
    cancelSpeech,
    setTranscript,
    hasRecognitionSupport
  };
};
