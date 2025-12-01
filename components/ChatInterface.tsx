import React, { useRef, useEffect } from 'react';
import { useTranslation } from '../i18n.tsx'; // Ensure .tsx extension for i18n

const ChatInterface = ({
  messages,
  transcript,
  isListening,
  isLoading,
  onSendMessage,
  onToggleListening
}) => {
  const scrollRef = useRef(null);
  const [inputValue, setInputValue] = React.useState('');
  const { t } = useTranslation(); // Use translation hook

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, transcript]);

  // Sync transcript to input while listening
  useEffect(() => {
    if (isListening) {
      setInputValue(transcript);
    }
  }, [transcript, isListening]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return React.createElement(
    "div",
    { className: "flex flex-col h-full max-w-3xl mx-auto p-4" },
    /* Messages Area (Overlay on bottom half) */
    React.createElement(
      "div",
      {
        ref: scrollRef,
        className: "flex-1 overflow-y-auto scrollbar-hide mb-4 space-y-4 pr-2",
        style: { maxHeight: '30vh' }
      },
      messages.map((msg) =>
        React.createElement(
          "div",
          {
            key: msg.id,
            className: `flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`
          },
          React.createElement(
            "div",
            {
              className: `
                max-w-[80%] px-4 py-2 rounded-2xl border-2 border-black
                ${msg.role === 'user'
                  ? 'bg-pastel-blue rounded-tr-none'
                  : 'bg-white rounded-tl-none'}
                shadow-[2px_2px_0px_rgba(0,0,0,1)]
              `
            },
            React.createElement("p", { className: "text-sm md:text-base font-bold" }, msg.content)
          )
        )
      ),
      isLoading &&
        React.createElement(
          "div",
          { className: "flex justify-start" },
          React.createElement(
            "div",
            { className: "bg-white px-4 py-2 rounded-2xl rounded-tl-none border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]" },
            React.createElement(
              "div",
              { className: "flex space-x-1" },
              React.createElement("div", { className: "w-2 h-2 bg-black rounded-full animate-bounce", style: { animationDelay: '0ms' } }),
              React.createElement("div", { className: "w-2 h-2 bg-black rounded-full animate-bounce", style: { animationDelay: '150ms' } }),
              React.createElement("div", { className: "w-2 h-2 bg-black rounded-full animate-bounce", style: { animationDelay: '300ms' } })
            )
          )
        )
    ),

    /* Input Area */
    React.createElement(
      "div",
      { className: "mt-auto" },
      React.createElement(
        "form",
        { onSubmit: handleSubmit, className: "flex items-end gap-2" },
        React.createElement(
          "div",
          { className: "relative flex-1" },
          React.createElement("input", {
            type: "text",
            value: inputValue,
            onChange: (e) => setInputValue(e.target.value),
            placeholder: isListening ? t("listening") : t("type_a_message"),
            disabled: isListening || isLoading,
            className: "w-full p-4 pl-4 pr-12 rounded-full border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all bg-white"
          })
        ),

        /* Voice Button */
        React.createElement(
          "button",
          {
            type: "button",
            onClick: onToggleListening,
            className: `
              p-4 rounded-full border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] 
              transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_rgba(0,0,0,1)]
              ${isListening ? 'bg-pastel-pink animate-pulse' : 'bg-white hover:bg-pastel-yellow'}
            `,
            title: t("toggle_voice_input")
          },
          isListening
            ? /* Mic Off Icon */
              React.createElement(
                "svg",
                { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 },
                React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" })
              )
            : /* Mic On Icon */
              React.createElement(
                "svg",
                { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 },
                React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" })
              )
        ),

        /* Send Button */
        !isListening &&
          React.createElement(
            "button",
            {
              type: "submit",
              disabled: !inputValue.trim() || isLoading,
              className: "p-4 rounded-full border-2 border-black bg-pastel-green shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:shadow-none"
            },
            React.createElement(
              "svg",
              { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 },
              React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M14 5l7 7m0 0l-7 7m7-7H3" })
            )
          )
      )
    )
  );
};

export default ChatInterface;