
import React, { useState } from 'react';
import { generateImage } from '../services/gemini';
import { GeneratedImage } from '../types';

interface ImageGenProps {
  isArabic: boolean;
}

const ImageGen: React.FC<ImageGenProps> = ({ isArabic }) => {
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    try {
      const imageUrl = await generateImage(prompt);
      if (imageUrl) {
        setHistory(prev => [{ url: imageUrl, prompt, timestamp: new Date() }, ...prev]);
        setPrompt('');
      } else {
        setError(isArabic ? 'فشل إنشاء الصورة. حاول مرة أخرى.' : 'Image generation failed. Try again.');
      }
    } catch (err) {
      setError(isArabic ? 'حدث خطأ غير متوقع.' : 'An unexpected error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  const suggestions = [
    isArabic ? 'رائد فضاء يركب خيلاً في الفضاء' : 'Astronaut riding a horse in space',
    isArabic ? 'منظر مدينة سايبربانك عند الغروب' : 'Cyberpunk city landscape at sunset',
    isArabic ? 'قطة لطيفة ترتدي نظارات شمسية' : 'Cute cat wearing sunglasses',
    isArabic ? 'لوحة زيتية لمنزل ريفي في الشتاء' : 'Oil painting of a countryside house in winter'
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="glass p-8 rounded-3xl">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">{isArabic ? 'ارسم خيالك' : 'Paint Your Imagination'}</h2>
          <p className="text-slate-400">{isArabic ? 'حول الكلمات إلى صور مذهلة باستخدام تقنية Gemini' : 'Transform words into stunning visuals using Gemini tech'}</p>
          
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={isArabic ? 'اكتب ما تريد رسمه...' : 'Describe what you want to create...'}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.628.288a2 2 0 01-1.645.033l-2.257-.903a5 5 0 00-3.931.144l-.358.156a2 2 0 01-.61.158L2.044 14.65M12 7.757v-3.5m0 0a2.25 2.25 0 10-4.5 0M12 4.257a2.25 2.25 0 114.5 0" />
                </svg>
              )}
              {isGenerating ? (isArabic ? 'جاري الإنشاء...' : 'Generating...') : (isArabic ? 'إنشاء' : 'Generate')}
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setPrompt(s)}
                className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors border border-slate-700"
              >
                {s}
              </button>
            ))}
          </div>

          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {isArabic ? 'الصور المنشأة' : 'Recent Creations'}
        </h3>
        
        {history.length === 0 ? (
          <div className="glass p-12 rounded-3xl text-center border-dashed border-2 border-slate-800">
            <p className="text-slate-500">{isArabic ? 'لا توجد صور بعد. ابدأ بإنشاء واحدة!' : 'No images yet. Start by creating one!'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden group">
                <div className="aspect-square relative overflow-hidden bg-slate-800">
                  <img src={item.url} alt={item.prompt} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <button 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = item.url;
                        link.download = `gemini-gen-${i}.png`;
                        link.click();
                      }}
                      className="w-full py-2 bg-white/20 backdrop-blur-md rounded-lg text-white font-medium hover:bg-white/30 transition-colors"
                    >
                      {isArabic ? 'تحميل الصورة' : 'Download'}
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-300 line-clamp-2 italic">"{item.prompt}"</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGen;
