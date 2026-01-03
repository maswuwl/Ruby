
import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const key = process.env.API_KEY || "";
  return new GoogleGenAI({ apiKey: key });
};

export const chatWithGemini = async (message: string, mediaParts: any[] = []) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{
        parts: [{ text: message }, ...mediaParts]
      }],
      config: {
        systemInstruction: `You are Ruby, a professional AI advisor. Tone: Minimalist, royal, and precise.`,
      }
    });
    return response.text || "Ruby system is ready.";
  } catch (err: any) {
    if (err.message?.includes("entity was not found") || err.message?.includes("API_KEY_INVALID")) return "ERROR_KEY_MISSING";
    return "لقد حدث خطأ في الاتصال بنظام روبي. يرجى التأكد من المفتاح.";
  }
};

export const searchGrounding = async (query: string) => {
  try {
    const ai = getAI();
    // استخدام gemini-2.5-flash لاستقرار البحث
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
    if (err.message?.includes("entity was not found")) return { text: "", sources: [], error: "ERROR_KEY_MISSING" };
    return { text: "فشل في الوصول للويب حالياً.", sources: [], error: "GENERIC_ERROR" };
  }
};

export const generateImage = async (prompt: string): Promise<{url: string | null, error: string | null}> => {
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
    return { url: null, error: "No image part" };
  } catch (err: any) {
    if (err.message?.includes("entity was not found")) return { url: null, error: "ERROR_KEY_MISSING" };
    return { url: null, error: "GENERIC_ERROR" };
  }
};
