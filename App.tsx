import React, { useState, useEffect } from 'react';
import SketchAvatar from './components/SketchAvatar';
import ChatInterface from './components/ChatInterface';
import { useSpeech } from './hooks/useSpeech';
import { sendMessageToGemini } from './services/geminiService';
import { INITIAL_EMOTION } from './constants';
import { LanguageProvider, useTranslation } from './i18n.tsx'; // Import i18n components

const AppContent = () => {
  const { lang, setLang, t } = useTranslation(); // Get language and translation function from context

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: t("welcome_message"), // Use translated welcome message
      emotion: 'happy',
      timestamp: Date.now()
    }
  ]);
  const [currentEmotion, setCurrentEmotion] = useState(INITIAL_EMOTION);
  const [isLoading, setIsLoading] = useState(false);

  const {
    isListening,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    speak,
    cancelSpeech,
    setTranscript
  } = useSpeech({ language: lang }); // Pass current language to useSpeech hook

  // If the user stops listening and there is a transcript, send it automatically
  useEffect(() => {
    if (!isListening && transcript.trim().length > 0) {
      handleSendMessage(transcript);
      setTranscript(''); // Clear buffer
    }
  }, [isListening, transcript]);

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      cancelSpeech(); // Stop avatar speaking if interrupting
      startListening();
    }
  };

  const handleSendMessage = async (text) => {
    // Add User Message
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      // FIX: Add missing 'emotion' property to user message to match state type.
      emotion: 'neutral',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Call API, passing the current language
    const response = await sendMessageToGemini(text, lang);

    setIsLoading(false);

    // Add Assistant Message
    const botMsg = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.reply,
      emotion: response.emotion,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, botMsg]);
    
    // Update Avatar State
    setCurrentEmotion(response.emotion);
    
    // Speak
    speak(response.reply);
  };

  const toggleLanguage = () => {
    // The `setLang` function from context expects a value, not a function.
    // Use the current `lang` value from context to determine the new language.
    setLang(lang === 'zh' ? 'en' : 'zh');
  };

  return React.createElement(
    "div",
    { className: "relative w-full h-screen flex flex-col overflow-hidden bg-pastel-bg dotted-background" },
    
    /* Header / Brand */
    React.createElement(
      "div",
      { className: "absolute top-4 left-4 z-10 flex items-center gap-4" },
      React.createElement("h1", { className: "text-2xl font-bold tracking-tight text-sketch-black" }, "SketchBot"),
      /* Language Switcher */
      React.createElement(
        "button",
        {
          onClick: toggleLanguage,
          className: "px-3 py-1 bg-white border-2 border-black rounded-full shadow-[2px_2px_0px_black] text-sm font-bold hover:bg-pastel-yellow transition-colors",
          title: "Toggle Language"
        },
        lang === 'zh' ? t('english') : t('chinese')
      )
    ),

    /* Main Content Area: Avatar occupies center */
    React.createElement(
      "div",
      { className: "flex-1 relative flex items-center justify-center pt-10 pb-40 lg:pb-20" },
      React.createElement(
        "div",
        { className: "w-64 h-64 md:w-96 md:h-96 relative" },
        /* Status Badge */
        isSpeaking &&
          React.createElement(
            "div",
            { className: "absolute -top-10 right-0 bg-white border-2 border-black px-3 py-1 rounded-full animate-bounce shadow-[2px_2px_0px_black]" },
            React.createElement("span", { className: "text-xs font-bold" }, t("speaking"))
          ),
        isListening &&
          React.createElement(
            "div",
            { className: "absolute -top-10 left-0 bg-pastel-pink border-2 border-black px-3 py-1 rounded-full animate-pulse shadow-[2px_2px_0px_black]" },
            React.createElement("span", { className: "text-xs font-bold" }, t("listening"))
          ),
        React.createElement(SketchAvatar, { emotion: currentEmotion, isSpeaking: isSpeaking })
      )
    ),

    /* Bottom Area: Chat Interface fixed at bottom */
    React.createElement(
      "div",
      { className: "absolute bottom-0 w-full z-20 bg-gradient-to-t from-pastel-bg via-pastel-bg to-transparent pt-10" },
      React.createElement(ChatInterface, {
        messages: messages,
        transcript: transcript,
        isListening: isListening,
        isLoading: isLoading,
        onSendMessage: handleSendMessage,
        onToggleListening: handleToggleListening
      })
    )
  );
};

const App = () => {
  return React.createElement(
    LanguageProvider,
    null,
    React.createElement(AppContent, null)
  );
};

export default App;
