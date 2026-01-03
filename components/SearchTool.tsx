
import React, { useState } from 'react';
import { searchGrounding } from '../services/gemini';
import { SearchResult } from '../types';
import { Search, Globe2, ExternalLink, Key, Sparkles, AlertCircle } from 'lucide-react';

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
    try {
      const data = await searchGrounding(query);
      if (data.error === "ERROR_KEY_MISSING") {
        setErrorType("KEY");
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

  const openKeyDialog = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="text-center space-y-1 mb-6">
        <h2 className="text-lg font-black text-white flex items-center justify-center gap-2">
          <Globe2 className="w-4 h-4 text-red-500" />
          <span className="tracking-widest uppercase">{isArabic ? 'استكشاف الويب' : 'Web Exploration'}</span>
        </h2>
        <p className="text-[10px] text-red-200/40 uppercase tracking-tighter">
          {isArabic ? 'بحث مباشر ومدعوم بالمصادر' : 'Real-time source-backed intelligence'}
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
          placeholder={isArabic ? 'عن ماذا تبحث؟' : 'What are you looking for?'}
          className="w-full bg-black/40 border border-red-900/10 rounded-full pl-12 pr-28 py-3 text-[13px] text-white focus:outline-none focus:border-red-600/50 transition-all placeholder:text-red-900/30"
        />
        <button
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          className="absolute right-1.5 top-1.5 bottom-1.5 px-6 bg-red-600 hover:bg-red-500 disabled:bg-red-950/40 text-white text-[11px] font-black rounded-full transition-all flex items-center gap-2"
        >
          {isSearching ? <Sparkles className="w-3 h-3 animate-spin" /> : null}
          {isSearching ? (isArabic ? 'جاري...' : '...') : (isArabic ? 'بحث' : 'Search')}
        </button>
      </div>

      {errorType === "KEY" && (
        <div className="glass p-6 rounded-2xl border-amber-600/20 text-center space-y-4">
           <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
           <p className="text-[12px] text-amber-200/70">{isArabic ? 'ميزة البحث تتطلب مفتاح API صالح. يرجى تنشيط المفتاح.' : 'Web search requires a valid API key. Please activate.'}</p>
           <button onClick={openKeyDialog} className="flex items-center gap-2 mx-auto px-5 py-2 bg-amber-600 text-white rounded-full text-[10px] font-black uppercase hover:bg-amber-500 transition-all">
             <Key className="w-3 h-3" /> {isArabic ? 'تنشيط المفتاح الآن' : 'Activate Key Now'}
           </button>
        </div>
      )}

      {isSearching && (
        <div className="space-y-3 px-4">
          <div className="h-2 bg-red-950/20 rounded-full animate-pulse w-3/4"></div>
          <div className="h-2 bg-red-950/20 rounded-full animate-pulse w-full"></div>
          <div className="h-2 bg-red-950/20 rounded-full animate-pulse w-5/6"></div>
        </div>
      )}

      {result && !isSearching && (
        <div className="glass p-6 rounded-[1.5rem] border-red-900/10 space-y-6">
          <div className="text-[13px] text-red-50/80 leading-relaxed whitespace-pre-wrap">
            {result.text}
          </div>

          {result.sources.length > 0 && (
            <div className="pt-4 border-t border-red-900/10">
              <h4 className="text-[9px] font-black text-red-500 mb-3 uppercase tracking-widest">
                {isArabic ? 'المصادر الموثوقة' : 'Trusted Sources'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.sources.map((source, i) => (
                  <a
                    key={i}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 bg-black/20 border border-red-900/5 rounded-xl hover:border-red-600/30 transition-all group"
                  >
                    <span className="text-[11px] text-red-200/60 truncate">{source.title || source.uri}</span>
                    <ExternalLink className="w-3 h-3 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
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
