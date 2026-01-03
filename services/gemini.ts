
import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const chatWithGemini = async (message: string, mediaParts: any[] = []) => {
  const ai = getAI();
  
  // Using generateContent instead of sendMessage to support multimodal parts effectively
  const contents = {
    parts: [
      { text: message },
      ...mediaParts
    ]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [contents],
    config: {
      systemInstruction: `You are Yaqoot, a royal AI advisor and senior engineer. 
      Analyze any provided images, videos, or code files with extreme precision.
      1. If a video/image is provided, describe it or solve tasks based on it.
      2. If code is requested, provide functional, high-quality blocks.
      3. Maintain a majestic, helpful, and professional tone in Arabic or English.`,
    }
  });
  
  return response.text;
};

export const generateImage = async (prompt: string): Promise<string | null> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return null;
};

export const searchGrounding = async (query: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: query,
    config: { tools: [{ googleSearch: {} }] },
  });
  const text = response.text || '';
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = chunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({
      title: chunk.web.title,
      uri: chunk.web.uri
    }));
  return { text, sources };
};
