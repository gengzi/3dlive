import React, { useState, useEffect } from 'react';
import SketchAvatar from './components/SketchAvatar';
import ThreeAvatar from './components/ThreeAvatar'; // Import the new 3D component
import ChatInterface from './components/ChatInterface';
import AvatarCreator from './components/AvatarCreator';
import DraggableWrapper from './components/DraggableWrapper';
import { useSpeech } from './hooks/useSpeech';
import { sendMessageToGemini } from './services/geminiService';
import { INITIAL_EMOTION } from './constants';
import { LanguageProvider, useTranslation } from './i18n.tsx';

const AppContent = () => {
  const { lang, setLang, t } = useTranslation();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: t("welcome_message"),
      emotion: 'happy',
      timestamp: Date.now()
    }
  ]);
  const [currentEmotion, setCurrentEmotion] = useState(INITIAL_EMOTION);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [customAvatarConfig, setCustomAvatarConfig] = useState(null);
  const [isAvatarDragging, setIsAvatarDragging] = useState(false);
  
  // New State for Avatar Mode
  const [avatarMode, setAvatarMode] = useState<'2d' | '3d'>('2d');

  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('customAvatar');
      if (savedConfig) {
        setCustomAvatarConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
        console.error("Failed to parse custom avatar config:", error);
        localStorage.removeItem('customAvatar');
    }
  }, []);

  const {
    isListening,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    speak,
    cancelSpeech,
    setTranscript
  } = useSpeech({ language: lang });

  useEffect(() => {
    if (!isListening && transcript.trim().length > 0) {
      handleSendMessage(transcript);
      setTranscript('');
    }
  }, [isListening, transcript]);

  const handleToggleListening = () => {
    if (isListening) stopListening();
    else {
      cancelSpeech();
      startListening();
    }
  };

  const handleSendMessage = async (text) => {
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      emotion: 'neutral',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const response = await sendMessageToGemini(text, lang);
    setIsLoading(false);

    const botMsg = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.reply,
      emotion: response.emotion,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, botMsg]);
    setCurrentEmotion(response.emotion);
    speak(response.reply);
  };

  const toggleLanguage = () => {
    setLang(lang === 'zh' ? 'en' : 'zh');
  };

  const toggleAvatarMode = () => {
    setAvatarMode(prev => prev === '2d' ? '3d' : '2d');
  };

  const handleSaveAvatar = (config) => {
    localStorage.setItem('customAvatar', JSON.stringify(config));
    setCustomAvatarConfig(config);
    setIsCreatorOpen(false);
  };

  const handleRestoreDefaultAvatar = () => {
    localStorage.removeItem('customAvatar');
    setCustomAvatarConfig(null);
  };

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      "div",
      { className: "relative w-full h-screen flex flex-col overflow-hidden bg-pastel-bg dotted-background" },
      
      /* Header */
      React.createElement(
        "div",
        { className: "absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2" },
        React.createElement("h1", { className: "text-2xl font-bold tracking-tight text-sketch-black mr-2" }, "SketchBot"),
        
        /* Language Switcher */
        React.createElement(
          "button",
          { onClick: toggleLanguage, className: "px-3 py-1 bg-white border-2 border-black rounded-full shadow-[2px_2px_0px_black] text-sm font-bold hover:bg-pastel-yellow transition-colors" },
          lang === 'zh' ? t('english') : t('chinese')
        ),
        
        /* Mode Switcher (2D/3D) */
        React.createElement(
          "button",
          { onClick: toggleAvatarMode, className: "px-3 py-1 bg-white border-2 border-black rounded-full shadow-[2px_2px_0px_black] text-sm font-bold hover:bg-pastel-blue transition-colors flex items-center gap-1" },
          avatarMode === '2d' ? '🧊 3D' : '✏️ 2D'
        ),

        /* Avatar Creator Button (Only show in 2D mode) */
        avatarMode === '2d' && React.createElement(
          "button",
          { onClick: () => setIsCreatorOpen(true), className: "px-3 py-1 bg-white border-2 border-black rounded-full shadow-[2px_2px_0px_black] text-sm font-bold hover:bg-pastel-pink transition-colors" },
          t('create_avatar')
        ),
        
        /* Restore Default Button - conditional rendering */
        (avatarMode === '2d' && customAvatarConfig) && React.createElement(
            "button",
            { onClick: handleRestoreDefaultAvatar, className: "px-3 py-1 bg-white border-2 border-black rounded-full shadow-[2px_2px_0px_black] text-sm font-bold hover:bg-pastel-blue transition-colors" },
            t('restore_default')
        )
      ),

      /* Main Content Area */
      React.createElement(
        "div",
        { className: "flex-1 relative flex items-center justify-center pt-10 pb-40 lg:pb-20 overflow-hidden" },
        
        /* Render 2D or 3D based on mode */
        avatarMode === '2d' ? (
            React.createElement(
              DraggableWrapper,
              { 
                onDragStateChange: setIsAvatarDragging,
                // Fix: pass children in props to satisfy type requirements
                children: React.createElement(
                  "div",
                  { className: "w-64 h-64 md:w-96 md:h-96 relative" },
                  isSpeaking && React.createElement(
                      "div", { className: "absolute -top-10 right-0 bg-white border-2 border-black px-3 py-1 rounded-full animate-bounce shadow-[2px_2px_0px_black]" },
                      React.createElement("span", { className: "text-xs font-bold" }, t("speaking"))
                  ),
                  isListening && React.createElement(
                      "div", { className: "absolute -top-10 left-0 bg-pastel-pink border-2 border-black px-3 py-1 rounded-full animate-pulse shadow-[2px_2px_0px_black]" },
                      React.createElement("span", { className: "text-xs font-bold" }, t("listening"))
                  ),
                  React.createElement(SketchAvatar, { 
                      emotion: currentEmotion, 
                      isSpeaking: isSpeaking, 
                      customAvatarConfig: customAvatarConfig,
                      isDragging: isAvatarDragging 
                  })
                )
              }
            )
        ) : (
            /* 3D Mode Container - We disable dragging here to allow OrbitControls to work properly */
            React.createElement(
                "div",
                { className: "w-full h-full max-w-4xl max-h-[80vh] relative" },
                isListening && React.createElement(
                    "div", { className: "absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-pastel-pink border-2 border-black px-4 py-2 rounded-full animate-pulse shadow-[2px_2px_0px_black]" },
                    React.createElement("span", { className: "text-sm font-bold" }, t("listening"))
                ),
                React.createElement(ThreeAvatar, { isSpeaking: isSpeaking })
            )
        )
      ),

      /* Bottom Chat Interface */
      React.createElement(
        "div",
        { className: "absolute bottom-0 w-full z-20 bg-gradient-to-t from-pastel-bg via-pastel-bg to-transparent pt-10 pointer-events-none" },
        React.createElement(
            "div", 
            { className: "pointer-events-auto" }, 
            React.createElement(ChatInterface, { messages: messages, transcript: transcript, isListening: isListening, isLoading: isLoading, onSendMessage: handleSendMessage, onToggleListening: handleToggleListening })
        )
      )
    ),
    /* Avatar Creator Modal */
    isCreatorOpen && React.createElement(AvatarCreator, { onSave: handleSaveAvatar, onClose: () => setIsCreatorOpen(false) })
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