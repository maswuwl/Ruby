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
    { id: Tool.DASHBOARD, label: isAr ? 'الرئيسية' : 'Home', icon: LayoutDashboard },
    { id: Tool.CHAT, label: isAr ? 'روبي AI' : 'Ruby AI', icon: MessageSquareCode },
    { id: Tool.CREATIVE, label: isAr ? 'الفن' : 'Art', icon: Palette },
    { id: Tool.EXPLORE, label: isAr ? 'الويب' : 'Web', icon: Globe2 },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={`fixed lg:relative inset-y-0 left-0 z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:w-64 w-64 transition-transform duration-500 bg-black/95 border-r border-red-900/30 flex flex-col shadow-2xl`}>
        <div className="p-6 flex-1">
          <div className="mb-8 flex items-center justify-between">
              <div className="relative group">
                  <div className="absolute inset-0 bg-red-600 rounded-full blur-xl opacity-10 group-hover:opacity-30 transition-opacity"></div>
                  <Diamond className="w-8 h-8 text-red-500 red-glow" />
              </div>
              <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 bg-red-900/10 rounded-lg text-red-400">
                <X className="w-4 h-4" />
              </button>
          </div>
          
          <nav className="space-y-1.5">
            {menuItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                    setActiveTool(id);
                    if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative ${
                  activeTool === id 
                    ? 'bg-gradient-to-br from-red-700 to-red-900 text-white' 
                    : 'text-red-200/40 hover:bg-red-900/10 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 transition-all ${activeTool === id ? 'text-red-300' : ''}`} />
                <span className="font-bold text-[9px] uppercase tracking-widest">{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-red-900/10 bg-red-950/5">
          <div className="flex items-center gap-2 bg-red-900/10 p-3 rounded-xl border border-red-900/10">
              <Sparkles className="w-4 h-4 text-red-500" />
              <div className="flex flex-col">
                  <span className="text-[8px] font-black text-red-100 uppercase">Ruby v2.1</span>
                  <span className="text-[7px] text-red-400 uppercase tracking-widest">Optimal Status</span>
              </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
