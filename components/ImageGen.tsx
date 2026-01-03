
import React, { useState } from 'react';
import { generateImage } from '../services/gemini';
import { GeneratedImage } from '../types';
import { Palette, Sparkles, Download, Key, AlertCircle } from 'lucide-react';

interface ImageGenProps {
  isArabic: boolean;
}

const ImageGen: React.FC<ImageGenProps> = ({ isArabic }) => {
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorType, setErrorType] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setErrorType(null);
    try {
      const result = await generateImage(prompt);
      if (result.error === "ERROR_KEY_REQUIRED") {
        setErrorType("KEY");
      } else if (result.url) {
        setHistory(prev => [{ url: result.url as string, prompt, timestamp: new Date() }, ...prev]);
        setPrompt('');
      } else {
        setErrorType("GENERIC");
      }
    } catch (err) {
      setErrorType("GENERIC");
    } finally {
      setIsGenerating(false);
    }
  };

  const openKeyDialog = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio && aiStudio.openSelectKey) {
      await aiStudio.openSelectKey();
      setErrorType(null);
    } else {
      alert(isArabic 
        ? "يرجى ضبط مفتاح الـ API في إعدادات البيئة لتشغيل المزايا الفنية." 
        : "Please set API_KEY in environment variables to enable art features.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="glass p-6 rounded-[2rem] border-red-900/10 text-center space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-black text-white flex items-center justify-center gap-2">
            <Palette className="w-4 h-4 text-red-500" />
            <span className="tracking-widest uppercase">{isArabic ? 'مرسم روبي' : 'Ruby Studio'}</span>
          </h2>
          <p className="text-[10px] text-red-200/40 uppercase tracking-widest">{isArabic ? 'حول خيالك إلى حقيقة بصرية' : 'Visualize your imagination'}</p>
        </div>
        
        <div className="flex flex-col gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={isArabic ? 'ماذا تريد أن أرسم لك؟' : 'Describe your vision...'}
            className="w-full bg-black/40 border border-red-900/10 rounded-2xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-red-600/50 resize-none h-20 placeholder:text-red-900/30"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:bg-red-950/40 text-white text-[11px] font-black rounded-full transition-all flex items-center justify-center gap-3 uppercase"
          >
            {isGenerating ? <Sparkles className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />}
            {isGenerating ? (isArabic ? 'جاري الرسم...' : 'Painting...') : (isArabic ? 'بدء التوليد' : 'Generate Art')}
          </button>
        </div>

        {errorType === "KEY" && (
          <div className="p-4 bg-amber-600/10 border border-amber-600/20 rounded-xl space-y-3">
             <div className="flex items-center justify-center gap-2 text-amber-500">
                <AlertCircle className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase">{isArabic ? 'يتطلب مفتاح API' : 'API Key Required'}</span>
             </div>
             <button onClick={openKeyDialog} className="flex items-center gap-2 mx-auto px-4 py-2 bg-amber-600 text-white rounded-full text-[9px] font-black uppercase shadow-lg shadow-amber-600/20">
               <Key className="w-3 h-3" /> {isArabic ? 'تنشيط المفتاح' : 'Activate Key'}
             </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {history.map((item, i) => (
          <div key={i} className="group relative glass rounded-xl overflow-hidden aspect-square border-red-900/10">
            <img src={item.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = item.url;
                  a.download = `ruby-art-${i}.png`;
                  a.click();
                }}
                className="p-3 bg-red-600 rounded-full text-white hover:scale-110 transition-transform"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGen;
