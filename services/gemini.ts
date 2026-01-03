
import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  // الاعتماد المباشر على مفتاح البيئة المحقون
  const key = process.env.API_KEY;
  if (!key) throw new Error("API_KEY_MISSING");
  return new GoogleGenAI({ apiKey: key });
};

export const chatWithGemini = async (message: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: message }] }],
      config: {
        systemInstruction: "You are Ruby, a minimalist royal AI engineer. Be concise and professional.",
      }
    });
    return response.text || "Ruby system processed your request.";
  } catch (err: any) {
    console.error("Gemini Error:", err);
    if (err.message === "API_KEY_MISSING" || err.message?.includes("entity was not found")) {
      return "ERROR_KEY_MISSING";
    }
    return "خطأ في الاتصال. يرجى التحقق من المفتاح.";
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
    return { text, sources, error: null };
  } catch (err: any) {
    if (err.message === "API_KEY_MISSING" || err.message?.includes("entity was not found")) {
      return { text: "", sources: [], error: "ERROR_KEY_MISSING" };
    }
    return { text: "فشل البحث حالياً.", sources: [], error: "GENERIC" };
  }
};

export const generateImage = async (prompt: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return { url: `data:image/png;base64,${part.inlineData.data}`, error: null };
    }
    return { url: null, error: "No image" };
  } catch (err: any) {
    if (err.message === "API_KEY_MISSING" || err.message?.includes("entity was not found")) {
      return { url: null, error: "ERROR_KEY_MISSING" };
    }
    return { url: null, error: "GENERIC" };
  }
};
