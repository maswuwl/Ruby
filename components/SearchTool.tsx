
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

    const data = await searchGrounding(query);
    if (data.error === "ERROR_KEY_REQUIRED") {
      setErrorType("KEY_REQUIRED");
    } else if (data.error) {
      setErrorType("GENERIC");
    } else {
      setResult(data);
    }
    setIsSearching(false);
  };

  const activateKey = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio && aiStudio.openSelectKey) {
      await aiStudio.openSelectKey();
      setErrorType(null);
    } else {
      alert(isArabic 
        ? "تنبيه: أنت تتصفح من رابط خارجي. يرجى تزويد Vercel بمفتاح API_KEY في الإعدادات لتفعيل البحث." 
        : "External link detected. Please add API_KEY to Vercel settings to enable search.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="text-center space-y-1 mb-8">
        <h2 className="text-lg font-black text-white flex items-center justify-center gap-2">
          <Globe2 className="w-4 h-4 text-red-500" />
          <span className="tracking-widest uppercase font-royal">{isArabic ? 'رادار الويب الملكي' : 'Royal Web Radar'}</span>
        </h2>
      </div>

      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={isArabic ? 'ماذا تريد أن تعرف؟' : 'What do you want to know?'}
          className="w-full bg-black/40 border border-red-900/10 rounded-full pl-6 pr-32 py-4 text-[13px] text-white focus:outline-none focus:border-red-600/50 transition-all"
        />
        <button
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          className="absolute right-1.5 top-1.5 bottom-1.5 px-6 bg-red-600 hover:bg-red-500 disabled:bg-red-950/40 text-white text-[11px] font-black rounded-full transition-all"
        >
          {isSearching ? <RefreshCw className="w-3 h-3 animate-spin" /> : (isArabic ? 'بحث' : 'Search')}
        </button>
      </div>

      {errorType === "KEY_REQUIRED" && (
        <div className="glass p-8 rounded-[2rem] border-amber-600/20 text-center space-y-4 animate-in zoom-in-95 shadow-2xl">
           <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
           <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase">{isArabic ? 'مطلوب تصريح وصول' : 'Access Required'}</h3>
              <p className="text-[11px] text-amber-200/50">{isArabic ? 'يتطلب البحث الذكي مفتاح API نشط.' : 'Smart search requires an active API key.'}</p>
           </div>
           <button 
             onClick={activateKey} 
             className="flex items-center gap-2 mx-auto px-8 py-3 bg-amber-600 text-white rounded-full text-[10px] font-black uppercase transition-all shadow-lg shadow-amber-600/20 active:scale-95"
           >
             <Key className="w-3 h-3" /> {isArabic ? 'تنشيط الآن' : 'Activate Now'}
           </button>
        </div>
      )}

      {isSearching && (
        <div className="py-20 text-center animate-pulse">
           <p className="text-[10px] text-red-500 uppercase tracking-widest">{isArabic ? 'جاري استجواب الويب...' : 'Querying the web...'}</p>
        </div>
      )}

      {result && (
        <div className="glass p-6 rounded-[1.5rem] border-red-900/10 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="text-[13px] text-red-50/90 leading-relaxed whitespace-pre-wrap">{result.text}</div>
          {result.sources.length > 0 && (
            <div className="pt-6 border-t border-red-900/10 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.sources.map((source, i) => (
                <a 
                  key={i} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-3 bg-red-950/5 border border-red-900/10 rounded-xl hover:bg-red-900/10 transition-all"
                >
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    <span className="text-[11px] font-bold text-red-100 truncate">{source.title}</span>
                    <span className="text-[9px] text-red-400/60 truncate">{source.uri}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-red-500 shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Fixed missing default export
export default SearchTool;
