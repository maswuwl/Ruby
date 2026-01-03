
import React, { useState, useEffect } from 'react';
import { Tool } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import ImageGen from './components/ImageGen';
import SearchTool from './components/SearchTool';
import { Menu, X, LayoutDashboard, MessageSquareCode, Palette, Globe2, Diamond } from 'lucide-react';

const TRANSLATIONS: any = {
  ar: { name: 'Ruby', welcome: 'مرحباً بك', sub: 'نظام روبي الفائق', lang: 'Ar' },
  en: { name: 'Ruby', welcome: 'Welcome', sub: 'Ruby AI', lang: 'En' }
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

  const navItems = [
    { id: Tool.DASHBOARD, icon: LayoutDashboard, label: lang === 'ar' ? 'الرئيسية' : 'Home' },
    { id: Tool.CHAT, icon: MessageSquareCode, label: lang === 'ar' ? 'روبي' : 'Ruby' },
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
        <header className="h-14 glass flex items-center justify-between px-6 z-20 border-b border-red-900/10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 bg-red-900/5 rounded-lg lg:hidden"
            >
              {isSidebarOpen ? <X className="w-4 h-4 text-red-400" /> : <Menu className="w-4 h-4 text-red-400" />}
            </button>
            <h1 className="text-sm lg:text-md font-black font-royal tracking-widest text-white flex items-center gap-2">
              <Diamond className="w-4 h-4 text-red-600 red-glow" />
              <span className="bg-gradient-to-l from-white to-red-400 bg-clip-text text-transparent uppercase">{t.name}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
             <button 
                onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                className="px-3 py-1 bg-red-900/10 rounded-full text-[10px] font-black text-red-400 uppercase border border-red-900/10"
             >
                {t.lang}
             </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20">
          <div className="max-w-5xl mx-auto h-full">
            {activeTool === Tool.DASHBOARD && <Dashboard setActiveTool={setActiveTool} isArabic={lang === 'ar'} />}
            {activeTool === Tool.CHAT && <Chat isArabic={lang === 'ar'} lang={lang} />}
            {activeTool === Tool.CREATIVE && <ImageGen isArabic={lang === 'ar'} />}
            {activeTool === Tool.EXPLORE && <SearchTool isArabic={lang === 'ar'} />}
          </div>
        </section>

        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 glass-premium rounded-full border border-red-900/10 shadow-2xl z-50">
           {navItems.map(({id, icon: Icon, label}) => (
             <button
               key={id}
               onClick={() => setActiveTool(id)}
               className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${activeTool === id ? 'bg-red-600 text-white' : 'text-red-400/40 hover:bg-red-900/10'}`}
             >
               <Icon className="w-3.5 h-3.5" />
               <span className={`text-[9px] font-black uppercase tracking-tighter overflow-hidden transition-all ${activeTool === id ? 'max-w-16' : 'max-w-0'}`}>{label}</span>
             </button>
           ))}
        </nav>
      </main>
    </div>
  );
};

export default App;
