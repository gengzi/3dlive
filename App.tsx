import React, { useState, useEffect } from 'react';
import Avatar from './components/Avatar';
import ChatInterface from './components/ChatInterface';
import { useSpeech } from './hooks/useSpeech';
import { sendMessageToGemini } from './services/geminiService';
import { Emotion, Message } from './types';
import { INITIAL_EMOTION } from './constants';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm SketchBot. We can chat by text or voice!",
      emotion: 'happy',
      timestamp: Date.now()
    }
  ]);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>(INITIAL_EMOTION);
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
  } = useSpeech();

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

  const handleSendMessage = async (text: string) => {
    // Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Call API
    const response = await sendMessageToGemini(text);

    setIsLoading(false);

    // Add Assistant Message
    const botMsg: Message = {
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

  return (
    <div className="relative w-full h-screen flex flex-col overflow-hidden bg-pastel-bg bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      
      {/* Header / Brand */}
      <div className="absolute top-4 left-4 z-10">
        <h1 className="text-2xl font-bold tracking-tight text-sketch-black">SketchBot</h1>
      </div>

      {/* Main Content Area: Avatar occupies center */}
      <div className="flex-1 relative flex items-center justify-center pt-10 pb-40 lg:pb-20">
        <div className="w-64 h-64 md:w-96 md:h-96 relative">
             {/* Status Badge */}
             {isSpeaking && (
                <div className="absolute -top-10 right-0 bg-white border-2 border-black px-3 py-1 rounded-full animate-bounce shadow-[2px_2px_0px_black]">
                    <span className="text-xs font-bold">Speaking...</span>
                </div>
             )}
             {isListening && (
                <div className="absolute -top-10 left-0 bg-pastel-pink border-2 border-black px-3 py-1 rounded-full animate-pulse shadow-[2px_2px_0px_black]">
                    <span className="text-xs font-bold">Listening...</span>
                </div>
             )}
            <Avatar emotion={currentEmotion} isSpeaking={isSpeaking} />
        </div>
      </div>

      {/* Bottom Area: Chat Interface fixed at bottom */}
      <div className="absolute bottom-0 w-full z-20 bg-gradient-to-t from-pastel-bg via-pastel-bg to-transparent pt-10">
        <ChatInterface 
          messages={messages}
          transcript={transcript}
          isListening={isListening}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onToggleListening={handleToggleListening}
        />
      </div>

    </div>
  );
};

export default App;
