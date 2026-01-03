
import React from 'react';
import { Tool } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Crown, Zap, ShieldCheck, Sparkles } from 'lucide-react';

interface DashboardProps {
  setActiveTool: (tool: Tool) => void;
  isArabic: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTool, isArabic }) => {
  const data = [
    { name: isArabic ? 'شات' : 'Chat', value: 450 },
    { name: isArabic ? 'إبداع' : 'Art', value: 380 },
    { name: isArabic ? 'بحث' : 'Search', value: 240 },
    { name: isArabic ? 'صوت' : 'Voice', value: 190 },
  ];

  const COLORS = ['#991b1b', '#dc2626', '#ef4444', '#7f1d1d'];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
                <Crown className="w-10 h-10 text-red-500 royal-glow" />
                {isArabic ? 'مرحباً، أيها القائد' : 'Welcome, Commander'}
            </h2>
            <p className="text-red-200/50">{isArabic ? 'إليك نظرة على قوة مملكة الذكاء الخاصة بك' : 'Behold the insights of your AI kingdom'}</p>
          </div>
          <div className="hidden md:flex gap-4">
              <div className="glass p-4 rounded-2xl flex items-center gap-3 border-red-500/30">
                  <div className="p-2 bg-red-500/20 rounded-lg"><Zap className="w-5 h-5 text-red-400" /></div>
                  <div className="text-xs uppercase font-bold tracking-widest text-red-100">Speed: Optimal</div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-[2rem] border-red-900/30">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-red-100">
            <Sparkles className="w-5 h-5 text-red-500" />
            {isArabic ? 'تحليل القوة التشغيلية' : 'Operational Power Analysis'}
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#450a0a" vertical={false} />
                <XAxis dataKey="name" stroke="#fca5a5" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#fca5a5" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#450a0a'}}
                  contentStyle={{backgroundColor: '#7f1d1d', border: '1px solid #dc2626', borderRadius: '16px', color: 'white'}}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-rows-2 gap-6">
            <div className="glass p-8 rounded-[2rem] border-red-900/30 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShieldCheck className="w-32 h-32 text-red-400" />
                </div>
                <h4 className="text-lg font-bold text-red-100 mb-2">{isArabic ? 'بروتوكول الأمان' : 'Security Protocol'}</h4>
                <p className="text-red-200/60 text-sm mb-4">{isArabic ? 'جميع المحادثات مشفرة ملكياً' : 'All conversations are royally encrypted'}</p>
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 pulse-red" style={{animationName: 'pulse-green'}}></div>
                    ACTIVE PROTECTION
                </div>
            </div>
            <div className="glass p-8 rounded-[2rem] border-red-900/30 bg-gradient-to-br from-red-600/20 to-transparent">
                <h4 className="text-lg font-bold text-red-100 mb-2">{isArabic ? 'إحصائية سريعة' : 'Quick Stats'}</h4>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-black/20 p-4 rounded-2xl">
                        <div className="text-2xl font-black text-red-400">1.2s</div>
                        <div className="text-[10px] text-red-200/50 uppercase font-bold">Latency</div>
                    </div>
                    <div className="bg-black/20 p-4 rounded-2xl">
                        <div className="text-2xl font-black text-emerald-400">99.9%</div>
                        <div className="text-[10px] text-red-200/50 uppercase font-bold">Uptime</div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
