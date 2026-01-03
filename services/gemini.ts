
import { GoogleGenAI } from "@google/genai";

/**
 * الحصول على نسخة من المحرك مع التأكد من وجود المفتاح
 */
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined" || apiKey === "" || apiKey.length < 10) {
    throw new Error("API_KEY_REQUIRED");
  }
  return new GoogleGenAI({ apiKey: apiKey });
};

export const chatWithGemini = async (message: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: message }] }],
      config: {
        systemInstruction: "You are Ruby, a professional royal AI. Use very concise language.",
      }
    });
    return response.text || "Processed.";
  } catch (err: any) {
    console.error("Chat Error:", err.message);
    const msg = err.message?.toLowerCase() || "";
    if (msg.includes("key") || msg.includes("not found") || msg.includes("401") || msg.includes("required")) {
      return "ERROR_KEY_REQUIRED";
    }
    return "حدث خطأ في الاتصال بنظام روبي.";
  }
};

export const searchGrounding = async (query: string) => {
  try {
    const ai = getAI();
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
    const msg = err.message?.toLowerCase() || "";
    // إذا كان الخطأ "entity was not found" نعيد خطأ المفتاح لتنشيطه مجدداً كما في التعليمات
    if (msg.includes("entity was not found") || msg.includes("key") || msg.includes("403") || msg.includes("required")) {
      return { text: "", sources: [], error: "ERROR_KEY_REQUIRED" };
    }
    return { text: "تعذر إتمام البحث الذكي.", sources: [], error: "GENERIC" };
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
    const msg = err.message?.toLowerCase() || "";
    if (msg.includes("key") || msg.includes("not found") || msg.includes("required")) {
      return { url: null, error: "ERROR_KEY_REQUIRED" };
    }
    return { url: null, error: "GENERIC" };
  }
};
