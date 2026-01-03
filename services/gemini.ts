
import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const key = process.env.API_KEY || "";
  return new GoogleGenAI({ apiKey: key });
};

export const chatWithGemini = async (message: string, mediaParts: any[] = []) => {
  try {
    const ai = getAI();
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
        systemInstruction: `You are Ruby, a royal AI advisor and senior engineer. 
        Maintain a majestic, helpful, and professional tone in Arabic or English.`,
      }
    });
    
    return response.text || "Ruby system is processing...";
  } catch (err) {
    console.error("Gemini Error:", err);
    return "لقد حدث خطأ في الاتصال بنظام روبي. يرجى التأكد من مفتاح الـ API.";
  }
};

export const generateImage = async (prompt: string): Promise<string | null> => {
  try {
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
  } catch (err) {
    return null;
  }
};

export const searchGrounding = async (query: string) => {
  try {
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
  } catch (err) {
    return { text: "فشل البحث حالياً.", sources: [] };
  }
};
