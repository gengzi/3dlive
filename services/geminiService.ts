import { GoogleGenAI } from "@google/genai";
import { GeminiResponse } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

const apiKey = process.env.API_KEY;
// Safe initialization check
if (!apiKey) {
  console.error("Gemini API Key is missing!");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const sendMessageToGemini = async (message: string): Promise<GeminiResponse> => {
  if (!apiKey) {
    return {
      reply: "Please set your API Key in the environment.",
      emotion: "sad"
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json", 
        // We ask for JSON directly to ensure emotion parsing
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    // Parse the JSON response
    const data = JSON.parse(text) as GeminiResponse;
    return data;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      reply: "Oops, I had a little brain freeze. Can you say that again?",
      emotion: "confused"
    };
  }
};
