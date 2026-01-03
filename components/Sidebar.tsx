
import React from 'react';
import { Tool } from '../types';
import { LayoutDashboard, MessageSquareCode, Palette, Globe2, Sparkles, Diamond, X } from 'lucide-react';

interface SidebarProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  lang: string;
  setLang: (l: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTool, setActiveTool, isOpen, setIsOpen, lang }) => {
  const isAr = lang === 'ar';
  
  const menuItems = [
    { id: Tool.DASHBOARD, label: isAr ? 'لوحة العرش' : 'Throne Board', icon: LayoutDashboard },
    { id: Tool.CHAT, label: isAr ? 'المستشار الملكي' : 'Royal Advisor', icon: MessageSquareCode },
    { id: Tool.CREATIVE, label: isAr ? 'خزانة الصور' : 'Vault of Art', icon: Palette },
    { id: Tool.EXPLORE, label: isAr ? 'عين المملكة' : 'Kingdom Eye', icon: Globe2 },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={`fixed lg:relative inset-y-0 left-0 z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:w-80 w-80 transition-transform duration-500 bg-black/95 border-r border-red-900/30 flex flex-col shadow-2xl`}>
        <div className="p-8 flex-1">
          <div className="mb-12 flex items-center justify-between lg:justify-center">
              <div className="relative group">
                  <div className="absolute inset-0 bg-red-600 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <Diamond className="w-12 h-12 text-red-500 red-glow transform group-hover:rotate-45 transition-transform duration-700" />
              </div>
              <button onClick={() => setIsOpen(false)} className="lg:hidden p-3 bg-red-900/20 rounded-xl text-red-400">
                <X className="w-5 h-5" />
              </button>
          </div>
          
          <nav className="space-y-3">
            {menuItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                    setActiveTool(id);
                    if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`w-full flex items-center gap-5 px-6 py-5 rounded-[1.5rem] transition-all duration-500 group relative ${
                  activeTool === id 
                    ? 'bg-gradient-to-br from-red-700 to-red-950 text-white shadow-lg shadow-red-950/40' 
                    : 'text-red-200/40 hover:bg-red-900/20 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 transition-all group-hover:scale-125 ${activeTool === id ? 'text-red-400' : ''}`} />
                <span className="font-bold text-[10px] uppercase tracking-widest">{label}</span>
                {activeTool === id && (
                    <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-red-400 pulse-active"></div>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-8 border-t border-red-900/20 bg-red-950/10">
          <div className="flex items-center gap-3 bg-red-900/20 p-4 rounded-2xl border border-red-900/10">
              <Sparkles className="w-5 h-5 text-red-500" />
              <div className="flex flex-col">
                  <span className="text-[10px] font-black text-red-100 uppercase tracking-tighter">Yaqoot Core v2.0</span>
                  <span className="text-[8px] text-red-400">STATUS: SUPREME</span>
              </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
