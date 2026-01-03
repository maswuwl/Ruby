
import { GoogleGenAI } from "@google/genai";

/**
 * إنشاء نسخة من المحرك تستخدم دائماً أحدث مفتاح محقون
 */
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY_MISSING");
  return new GoogleGenAI({ apiKey });
};

export const chatWithGemini = async (message: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: message }] }],
      config: {
        systemInstruction: "You are Ruby, a professional royal AI. Use very concise language. Font style: Minimalist.",
      }
    });
    return response.text || "Processed.";
  } catch (err: any) {
    console.error("Chat Error:", err.message);
    if (err.message?.includes("not found") || err.message?.includes("key")) return "ERROR_KEY_REQUIRED";
    return "خطأ في الاتصال بنظام روبي.";
  }
};

export const searchGrounding = async (query: string) => {
  try {
    const ai = getAI();
    // نستخدم gemini-2.0-flash-exp أو gemini-1.5-flash لضمان توافق أكبر مع أدوات البحث
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: { 
        tools: [{ googleSearch: {} }] 
      },
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
    console.error("Search Logic Error:", err.message);
    // إذا كان الخطأ متعلقاً بالصلاحيات أو "Entity not found"
    if (err.message?.includes("entity was not found") || err.message?.includes("permission") || err.message?.includes("404")) {
      return { text: "", sources: [], error: "ERROR_KEY_REQUIRED" };
    }
    return { text: "تعذر إتمام البحث. قد يحتاج المفتاح لتفعيل ميزة البحث.", sources: [], error: "GENERIC" };
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
    return { url: null, error: "NO_IMAGE" };
  } catch (err: any) {
    if (err.message?.includes("not found")) return { url: null, error: "ERROR_KEY_REQUIRED" };
    return { url: null, error: "GENERIC" };
  }
};
