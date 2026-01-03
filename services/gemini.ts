
import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined" || apiKey === "" || apiKey.length < 5) {
    throw new Error("API_KEY_REQUIRED");
  }
  return new GoogleGenAI({ apiKey });
};

export const chatWithGemini = async (message: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: message }] }],
      config: {
        systemInstruction: "You are Ruby, a professional royal AI. Represent luxury and efficiency.",
      }
    });
    return response.text || "Processed.";
  } catch (err: any) {
    if (err.message?.includes("API_KEY_REQUIRED") || err.message?.includes("401")) return "ERROR_KEY_REQUIRED";
    return "حدث خطأ في النظام الملكي.";
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
    const sources = chunks.filter((chunk: any) => chunk.web).map((chunk: any) => ({
      title: chunk.web.title,
      uri: chunk.web.uri
    }));
    return { text, sources, error: null };
  } catch (err: any) {
    const msg = err.message?.toLowerCase() || "";
    if (msg.includes("key") || msg.includes("403") || msg.includes("required") || msg.includes("not found")) {
      return { text: "", sources: [], error: "ERROR_KEY_REQUIRED" };
    }
    return { text: "تعذر إكمال البحث.", sources: [], error: "GENERIC" };
  }
};

export const generateImage = async (prompt: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
    });
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (part) return { url: `data:image/png;base64,${part.inlineData?.data}`, error: null };
    return { url: null, error: "NO_IMAGE" };
  } catch (err: any) {
    return { url: null, error: "ERROR_KEY_REQUIRED" };
  }
};
