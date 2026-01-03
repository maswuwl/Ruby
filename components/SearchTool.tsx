
import React, { useState } from 'react';
import { searchGrounding } from '../services/gemini';
import { SearchResult } from '../types';

interface SearchToolProps {
  isArabic: boolean;
}

const SearchTool: React.FC<SearchToolProps> = ({ isArabic }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ text: string, sources: SearchResult[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim() || isSearching) return;

    setIsSearching(true);
    try {
      const data = await searchGrounding(query);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6 animate-in zoom-in duration-500 max-w-4xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
          {isArabic ? 'استكشاف الويب الذكي' : 'Intelligent Web Explore'}
        </h2>
        <p className="text-slate-400">
          {isArabic ? 'احصل على إجابات مدعومة بأحدث المعلومات من الإنترنت.' : 'Get answers backed by the latest information from the web.'}
        </p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={isArabic ? 'ابحث عن أي شيء (مثل: أخبار اليوم في التكنولوجيا)...' : 'Search for anything (e.g., Today tech news)...'}
            className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          className="px-8 py-4 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-amber-900/20"
        >
          {isSearching ? (isArabic ? 'جاري البحث...' : 'Searching...') : (isArabic ? 'ابحث' : 'Search')}
        </button>
      </div>

      {isSearching && (
        <div className="space-y-4">
          <div className="h-4 bg-slate-800 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-slate-800 rounded animate-pulse w-full"></div>
          <div className="h-4 bg-slate-800 rounded animate-pulse w-5/6"></div>
        </div>
      )}

      {result && !isSearching && (
        <div className="glass p-8 rounded-3xl space-y-8">
          <div className="prose prose-invert max-w-none text-slate-200 leading-relaxed text-lg">
            {result.text}
          </div>

          {result.sources.length > 0 && (
            <div className="pt-6 border-t border-slate-700">
              <h4 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">
                {isArabic ? 'المصادر المرجعية' : 'Verification Sources'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.sources.map((source, i) => (
                  <a
                    key={i}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-amber-500/30 transition-all group"
                  >
                    <div className="w-8 h-8 flex-shrink-0 bg-slate-800 rounded flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-slate-300 truncate">{source.title || source.uri}</span>
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
