import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

// Initialize the SDK directly with process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const sendMessageToGemini = async (message, currentLang) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        // Dynamically add language instruction to the system instruction
        systemInstruction: `${SYSTEM_INSTRUCTION}\nAlways reply in ${currentLang === 'zh' ? 'Chinese' : 'English'}.`,
        responseMimeType: "application/json", 
        // Enforce JSON output structure.
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
            },
            emotion: {
              type: Type.STRING,
            },
          },
          required: ["reply", "emotion"],
        },
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    // Parse the JSON response
    const data = JSON.parse(text);
    return data;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      reply: "Oops, I had a little brain freeze. Can you say that again?", // This message is intentionally not translated here, as it's an API error.
      emotion: "confused"
    };
  }
};