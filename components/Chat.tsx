
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { chatWithGemini } from '../services/gemini';
import { 
  Send, Copy, Sparkles, ImageIcon, Key
} from 'lucide-react';

interface ChatProps {
  isArabic: boolean;
  lang: string;
}

const Chat: React.FC<ChatProps> = ({ isArabic, lang }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      text: lang === 'ar' ? 'أهلاً بك. كيف يمكنني مساعدتك اليوم؟' : 'Welcome. How can I assist you today?',
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyPrompt, setShowKeyPrompt] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    const userMsg: Message = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    
    try {
      const responseText = await chatWithGemini(input);
      if (responseText === "ERROR_KEY_REQUIRED") {
        setShowKeyPrompt(true);
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: isArabic ? 'يرجى تنشيط مفتاح الـ API للبدء.' : 'Please activate API Key to start.', 
          timestamp: new Date() 
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: new Date() }]);
      }
      setInput('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const openKeyDialog = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio && aiStudio.openSelectKey) {
      await aiStudio.openSelectKey();
      setShowKeyPrompt(false);
      // لا نحتاج لـ reload هنا، سنسمح للمستخدم بالمحاولة مباشرة
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] gap-4 relative">
      <div className="flex flex-col glass rounded-[1.5rem] overflow-hidden w-full relative h-full">
        
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 lg:px-6 space-y-6 pb-24 scrollbar-hide">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] lg:max-w-[75%] rounded-[1.2rem] px-4 py-2.5 shadow-sm transition-all ${
                msg.role === 'user' 
                  ? 'bg-red-600 text-white rounded-tr-none' 
                  : 'bg-red-950/20 text-red-50/90 rounded-tl-none border border-red-900/10 backdrop-blur-md'
              }`}>
                <div className="text-[12px] md:text-[13px] leading-relaxed">
                   {msg.text.split(/(```[\s\S]*?```)/g).map((part, index) => {
                      if (part.startsWith('```')) {
                        const code = part.replace(/```(\w+)?/g, '').replace(/```/g, '').trim();
                        return (
                          <div key={index} className="my-3 rounded-lg border border-red-900/20 bg-black/80 overflow-hidden">
                            <div className="bg-red-950/40 px-3 py-1.5 flex items-center justify-between border-b border-red-900/10">
                               <span className="text-[9px] font-black text-red-400 uppercase tracking-tighter">Code</span>
                               <button onClick={() => navigator.clipboard.writeText(code)} className="p-1 hover:bg-red-900/40 rounded text-red-400"><Copy className="w-3 h-3" /></button>
                            </div>
                            <pre className="p-3 text-[10px] font-mono overflow-x-auto text-red-100/70"><code>{code}</code></pre>
                          </div>
                        );
                      }
                      return <p key={index} className="whitespace-pre-wrap">{part}</p>;
                   })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-pulse">
               <div className="px-4 py-2 bg-red-950/10 rounded-full border border-red-900/10 flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-red-500 animate-spin" />
                  <span className="text-[10px] font-bold text-red-400 uppercase">{isArabic ? 'جاري التفكير...' : 'Thinking...'}</span>
               </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-4 left-0 right-0 px-4 flex flex-col items-center pointer-events-none">
          <div className="w-full max-w-xl pointer-events-auto flex flex-col gap-2">
            
            {showKeyPrompt && (
              <button 
                onClick={openKeyDialog}
                className="mx-auto flex items-center gap-2 px-6 py-2.5 bg-amber-600 text-white border border-amber-500 rounded-full text-[10px] font-black uppercase hover:bg-amber-500 transition-all shadow-xl shadow-amber-900/40 active:scale-95"
              >
                <Key className="w-3 h-3" /> {isArabic ? 'تنشيط النظام الملكي الآن' : 'Activate Royal System Now'}
              </button>
            )}

            <div className="glass-premium rounded-full p-1 flex items-center gap-1 border border-red-800/20 shadow-xl bg-black/60">
              <div className="flex items-center gap-0.5 ml-1">
                <button onClick={() => imageInputRef.current?.click()} className="p-2 text-red-400/50 hover:text-white transition-all">
                  <ImageIcon className="w-4 h-4" />
                  <input type="file" accept="image/*" multiple ref={imageInputRef} className="hidden" />
                </button>
              </div>

              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={isArabic ? 'أمرك...' : 'Command...'}
                className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-red-900/30 py-2 px-2 resize-none max-h-24 overflow-y-auto text-[13px] leading-tight scrollbar-hide"
              />

              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="mr-1 p-2 bg-red-600 hover:bg-red-500 disabled:bg-red-950/40 text-white rounded-full transition-all shadow-lg"
              >
                <Send className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
