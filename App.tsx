import React, { useState, useEffect } from 'react';
import { Tool } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import ImageGen from './components/ImageGen';
import SearchTool from './components/SearchTool';
import { Menu, X, LayoutDashboard, MessageSquareCode, Palette, Globe2, Diamond } from 'lucide-react';

const TRANSLATIONS: any = {
  ar: { name: 'Ruby', welcome: 'مرحباً بك', sub: 'نظام روبي الفائق', lang: 'العربية' },
  en: { name: 'Ruby', welcome: 'Welcome', sub: 'Ruby Super-AI', lang: 'English' }
};

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool>(Tool.DASHBOARD);
  const [lang, setLang] = useState('ar');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const renderTool = () => {
    switch (activeTool) {
      case Tool.DASHBOARD: return <Dashboard setActiveTool={setActiveTool} isArabic={lang === 'ar'} />;
      case Tool.CHAT: return <Chat isArabic={lang === 'ar'} lang={lang} />;
      case Tool.CREATIVE: return <ImageGen isArabic={lang === 'ar'} />;
      case Tool.EXPLORE: return <SearchTool isArabic={lang === 'ar'} />;
      default: return <Dashboard setActiveTool={setActiveTool} isArabic={lang === 'ar'} />;
    }
  };

  const navItems = [
    { id: Tool.DASHBOARD, icon: LayoutDashboard, label: lang === 'ar' ? 'الرئيسية' : 'Home' },
    { id: Tool.CHAT, icon: MessageSquareCode, label: lang === 'ar' ? 'روبي AI' : 'Ruby AI' },
    { id: Tool.CREATIVE, icon: Palette, label: lang === 'ar' ? 'الفن' : 'Art' },
    { id: Tool.EXPLORE, icon: Globe2, label: lang === 'ar' ? 'الويب' : 'Web' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0202]">
      <Sidebar 
        activeTool={activeTool} 
        setActiveTool={setActiveTool} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        lang={lang}
        setLang={setLang}
      />

      <main className="flex-1 flex flex-col overflow-hidden transition-all duration-500 relative">
        <header className="h-16 glass flex items-center justify-between px-6 lg:px-10 z-20 border-b border-red-900/20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-red-900/10 rounded-xl hover:bg-red-600/20 transition-all border border-red-900/10 lg:hidden"
            >
              {isSidebarOpen ? <X className="w-5 h-5 text-red-400" /> : <Menu className="w-5 h-5 text-red-400" />}
            </button>
            <h1 className="text-lg lg:text-xl font-black font-royal tracking-[0.1em] text-white flex items-center gap-2">
              <Diamond className="w-5 h-5 text-red-600 red-glow" />
              <span className="bg-gradient-to-l from-white to-red-400 bg-clip-text text-transparent">{t.name}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex bg-black/40 rounded-full p-0.5 border border-red-900/20">
                {['ar', 'en'].map(l => (
                    <button 
                        key={l}
                        onClick={() => setLang(l)}
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${lang === l ? 'bg-red-600 text-white' : 'text-red-400/50'}`}
                    >
                        {l}
                    </button>
                ))}
             </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 relative">
          <div className="max-w-6xl mx-auto h-full">
            {renderTool()}
          </div>
        </section>

        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 glass-premium rounded-full border border-red-900/20 shadow-2xl z-50">
           {navItems.map(({id, icon: Icon, label}) => (
             <button
               key={id}
               onClick={() => setActiveTool(id)}
               className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-500 ${activeTool === id ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-red-400/50 hover:bg-red-900/20'}`}
             >
               <Icon className="w-4 h-4" />
               <span className={`text-[9px] font-black uppercase tracking-widest overflow-hidden transition-all ${activeTool === id ? 'max-w-20' : 'max-w-0'}`}>{label}</span>
             </button>
           ))}
        </nav>
      </main>
    </div>
  );
};

export default App;
