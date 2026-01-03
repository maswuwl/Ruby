
import React, { useState, useEffect } from 'react';
import { Tool } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import ImageGen from './components/ImageGen';
import SearchTool from './components/SearchTool';
import { Menu, X, LayoutDashboard, MessageSquareCode, Palette, Globe2, Diamond } from 'lucide-react';

const TRANSLATIONS: any = {
  ar: { name: 'ياقوت', welcome: 'مرحباً بك في القصر الذكي', sub: 'قوة الذكاء الاصطناعي الملكي', lang: 'العربية' },
  en: { name: 'Yaqoot', welcome: 'Welcome to the Smart Palace', sub: 'Royal AI Power', lang: 'English' },
  fr: { name: 'Yaqoot', welcome: 'Bienvenue au Palais Intelligent', sub: 'Puissance de l\'IA Royale', lang: 'Français' },
  es: { name: 'Yaqoot', welcome: 'Bienvenido al Palacio Inteligente', sub: 'Poder de la IA Real', lang: 'Español' }
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
    { id: Tool.DASHBOARD, icon: LayoutDashboard, label: lang === 'ar' ? 'العرش' : 'Home' },
    { id: Tool.CHAT, icon: MessageSquareCode, label: lang === 'ar' ? 'المستشار' : 'AI' },
    { id: Tool.CREATIVE, icon: Palette, label: lang === 'ar' ? 'خزانة' : 'Art' },
    { id: Tool.EXPLORE, icon: Globe2, label: lang === 'ar' ? 'عين' : 'Web' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0202]">
      {/* Sidebar - Always accessible via toggle */}
      <Sidebar 
        activeTool={activeTool} 
        setActiveTool={setActiveTool} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        lang={lang}
        setLang={setLang}
      />

      <main className="flex-1 flex flex-col overflow-hidden transition-all duration-500 relative">
        {/* Unified Header */}
        <header className="h-20 glass flex items-center justify-between px-6 lg:px-12 z-20 border-b border-red-900/20 backdrop-blur-3xl">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-3 bg-red-900/20 rounded-2xl hover:bg-red-600/30 transition-all border border-red-900/10 group"
            >
              {isSidebarOpen ? <X className="w-6 h-6 text-red-400" /> : <Menu className="w-6 h-6 text-red-400 group-hover:scale-110" />}
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl lg:text-3xl font-black font-royal tracking-[0.2em] text-white flex items-center gap-3">
                <Diamond className="w-6 h-6 text-red-600 red-glow animate-pulse" />
                <span className="bg-gradient-to-l from-white to-red-400 bg-clip-text text-transparent">{t.name}</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3 lg:gap-6">
             <div className="hidden lg:flex flex-col items-end mr-4">
                <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">{t.sub}</span>
                <span className="text-[9px] text-red-200/40">{t.welcome}</span>
             </div>
             <div className="flex bg-black/40 rounded-full p-1 border border-red-900/20 shadow-inner">
                {Object.keys(TRANSLATIONS).map(l => (
                    <button 
                        key={l}
                        onClick={() => setLang(l)}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${lang === l ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'text-red-400/50 hover:text-white'}`}
                    >
                        {l}
                    </button>
                ))}
             </div>
          </div>
        </header>

        {/* Content Area */}
        <section className="flex-1 overflow-y-auto p-4 lg:p-10 pb-32 lg:pb-10 relative">
          <div className="max-w-7xl mx-auto h-full">
            {renderTool()}
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/5 rounded-full blur-[150px] pointer-events-none"></div>
        </section>

        {/* Royal Dock (Bottom Navigation for App Feel) */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 glass-premium rounded-[2.5rem] border border-red-900/30 shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50 bg-black/80 backdrop-blur-2xl">
           {navItems.map(({id, icon: Icon, label}) => (
             <button
               key={id}
               onClick={() => setActiveTool(id)}
               className={`flex items-center gap-3 px-6 py-3.5 rounded-full transition-all duration-500 group ${activeTool === id ? 'bg-red-600 text-white shadow-lg shadow-red-900/40 scale-105' : 'text-red-400/50 hover:bg-red-900/20 hover:text-red-400'}`}
             >
               <Icon className={`w-5 h-5 ${activeTool === id ? 'scale-110' : ''}`} />
               <span className={`text-[10px] font-black uppercase tracking-widest overflow-hidden transition-all ${activeTool === id ? 'max-w-20' : 'max-w-0'}`}>{label}</span>
             </button>
           ))}
        </nav>
      </main>
    </div>
  );
};

export default App;
