
import React, { useState } from 'react';
import { searchGrounding } from '../services/gemini';
import { SearchResult } from '../types';
import { Search, Globe2, ExternalLink, Key, ShieldAlert, RefreshCw, Info } from 'lucide-react';

interface SearchToolProps {
  isArabic: boolean;
}

const SearchTool: React.FC<SearchToolProps> = ({ isArabic }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ text: string, sources: SearchResult[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorType, setErrorType] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim() || isSearching) return;
    setIsSearching(true);
    setErrorType(null);
    setResult(null);

    try {
      const data = await searchGrounding(query);
      if (data.error === "ERROR_KEY_REQUIRED") {
        setErrorType("KEY_REQUIRED");
      } else if (data.error) {
        setErrorType("GENERIC");
      } else {
        setResult(data);
      }
    } catch (err) {
      setErrorType("GENERIC");
    } finally {
      setIsSearching(false);
    }
  };

  const activateKey = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio && aiStudio.openSelectKey) {
      try {
        await aiStudio.openSelectKey();
        setErrorType(null); // نفترض النجاح حسب تعليمات السباق التقني
      } catch (e) {
        console.error("Activation failed", e);
      }
    } else {
      // رسالة واضحة لمستخدمي الاستضافات الخارجية مثل Vercel
      alert(isArabic 
        ? "تنبيه: أنت الآن تستخدم نسخة مستضافة خارج AI Studio. لتفعيل ميزة البحث، يجب عليك إضافة مفتاح الـ API الخاص بك في إعدادات (Environment Variables) في Vercel باسم API_KEY."
        : "Notice: You are running outside AI Studio. To enable search, you must add your API_KEY to Vercel's Environment Variables.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="text-center space-y-1 mb-8">
        <h2 className="text-lg font-black text-white flex items-center justify-center gap-2">
          <Globe2 className="w-4 h-4 text-red-500" />
          <span className="tracking-widest uppercase font-royal">{isArabic ? 'رادار الويب الملكي' : 'Royal Web Radar'}</span>
        </h2>
        <p className="text-[10px] text-red-200/30 uppercase tracking-[0.2em]">
          {isArabic ? 'اتصال مباشر بمحركات بحث جوجل' : 'Direct neural link to Google Search'}
        </p>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-red-900/40 group-focus-within:text-red-500 transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={isArabic ? 'اسأل عما يحدث في العالم الآن...' : 'Search current events...'}
          className="w-full bg-black/40 border border-red-900/10 rounded-full pl-12 pr-32 py-3.5 text-[13px] text-white focus:outline-none focus:border-red-600/50 transition-all placeholder:text-red-900/20"
        />
        <button
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          className="absolute right-1.5 top-1.5 bottom-1.5 px-6 bg-red-600 hover:bg-red-500 disabled:bg-red-950/40 text-white text-[11px] font-black rounded-full transition-all flex items-center gap-2"
        >
          {isSearching ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
          {isSearching ? (isArabic ? 'جاري الفحص...' : 'Scanning...') : (isArabic ? 'بحث' : 'Search')}
        </button>
      </div>

      {errorType === "KEY_REQUIRED" && (
        <div className="glass p-8 rounded-[2rem] border-amber-600/20 text-center space-y-4 shadow-2xl shadow-amber-900/20 animate-in zoom-in-95">
           <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
           <div className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase">{isArabic ? 'تنشيط الصلاحيات الملكية مطلوب' : 'Royal Activation Required'}</h3>
              <p className="text-[11px] text-amber-200/60 leading-relaxed max-w-sm mx-auto">
                {isArabic 
                  ? 'ميزة البحث تتطلب مفتاح API مدفوع أو مفعل فيه نظام الفوترة. إذا كنت في Vercel، يرجى ضبط المفتاح في الإعدادات.' 
                  : 'Search feature requires a billing-enabled API key. If on Vercel, please set the key in project settings.'}
              </p>
           </div>
           
           <div className="flex flex-col gap-3">
             <button 
               onClick={activateKey} 
               className="flex items-center gap-3 mx-auto px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-full text-[11px] font-black uppercase transition-all shadow-xl shadow-amber-600/30 active:scale-95"
             >
               <Key className="w-3.5 h-3.5" /> {isArabic ? 'محاولة التنشيط التلقائي' : 'Try Auto Activation'}
             </button>
             
             <div className="flex items-start gap-2 max-w-xs mx-auto text-left p-3 bg-red-950/20 rounded-xl border border-red-900/10">
               <Info className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
               <p className="text-[9px] text-red-200/50 uppercase leading-tight">
                 {isArabic 
                   ? "ملاحظة لـ Vercel: ميزة البحث تعتمد على وجود مفتاح API صالح في إعدادات البيئة (Environment Variables) للمشروع." 
                   : "Vercel Tip: Search relies on a valid API_KEY set in your project's Environment Variables."}
               </p>
             </div>
           </div>
        </div>
      )}

      {isSearching && (
        <div className="py-20 text-center space-y-4">
           <div className="relative w-12 h-12 mx-auto">
              <div className="absolute inset-0 border-2 border-red-900/20 rounded-full"></div>
              <div className="absolute inset-0 border-t-2 border-red-600 rounded-full animate-spin"></div>
           </div>
           <p className="text-[10px] text-red-500 uppercase tracking-widest animate-pulse">
             {isArabic ? 'جاري استجواب مصادر الويب...' : 'Interrogating web sources...'}
           </p>
        </div>
      )}

      {result && (
        <div className="glass p-6 rounded-[1.5rem] border-red-900/10 space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-[13px] text-red-50/90 leading-relaxed whitespace-pre-wrap selection:bg-red-600/30">
            {result.text}
          </div>

          {result.sources.length > 0 && (
            <div className="pt-6 border-t border-red-900/10">
              <h4 className="text-[9px] font-black text-red-500 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                <Globe2 className="w-3 h-3" />
                {isArabic ? 'المصادر المستند إليها' : 'Verified Intel Sources'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.sources.map((source, i) => (
                  <a
                    key={i}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-red-950/5 border border-red-900/5 rounded-xl hover:border-red-600/30 hover:bg-red-950/20 transition-all group"
                  >
                    <span className="text-[11px] text-red-200/50 group-hover:text-red-100 truncate mr-2">{source.title || source.uri}</span>
                    <ExternalLink className="w-3 h-3 text-red-800 group-hover:text-red-500 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchTool;
