import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { chatWithGemini } from '../services/gemini';
import { 
  Mic, MicOff, Send, Play, Eye, Copy, 
  Terminal, Code2, Headphones, 
  Paperclip, FolderOpen, Layers, Cpu, Sparkles, X, ChevronUp,
  Image as ImageIcon, Film, FileCode
} from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

interface ChatProps {
  isArabic: boolean;
  lang: string;
}

const Chat: React.FC<ChatProps> = ({ isArabic, lang }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      text: lang === 'ar' ? 'أهلاً بك في محراب ياقوت. أنا عقلك البرمجي المدبّر.' :
            lang === 'en' ? 'Welcome to the Sanctuary of Yaqoot. I am your architectural mind.' :
            'Bienvenido al Santuario de Yaqoot.',
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
  const [attachments, setAttachments] = useState<{file: File, type: 'image' | 'video' | 'file', preview?: string}[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const liveSessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'file') => {
    const selectedFiles = Array.from(e.target.files || []) as File[];
    selectedFiles.forEach(async (file) => {
      let preview = undefined;
      if (type === 'image') preview = URL.createObjectURL(file);
      setAttachments(prev => [...prev, { file, type, preview }]);
    });
    e.target.value = ''; 
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  };

  const startVoice = async () => {
    if (isVoiceActive) {
        liveSessionRef.current?.close();
        setIsVoiceActive(false);
        return;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        let nextStartTime = 0;

        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } },
                systemInstruction: "You are Yaqoot, a royal AI advisor."
            },
            callbacks: {
                onopen: () => {
                    setIsVoiceActive(true);
                    const source = inputAudioContext.createMediaStreamSource(stream);
                    const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                    scriptProcessor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        const int16 = new Int16Array(inputData.length);
                        for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
                        sessionPromise.then(s => s.sendRealtimeInput({ media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } }));
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContext.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    const audioBase64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (audioBase64) {
                        const audioBuffer = await decodeAudioData(decode(audioBase64), outputAudioContext);
                        const source = outputAudioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputAudioContext.destination);
                        nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                        source.start(nextStartTime);
                        nextStartTime += audioBuffer.duration;
                        sourcesRef.current.add(source);
                    }
                },
                onclose: () => setIsVoiceActive(false),
                onerror: () => setIsVoiceActive(false)
            }
        });
        liveSessionRef.current = await sessionPromise;
    } catch (err) { console.error(err); }
  };

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;
    setIsLoading(true);
    const userMsg: Message = { 
      role: 'user', 
      text: input || `${attachments.length} files`, 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, userMsg]);
    try {
      const mediaParts = await Promise.all(attachments.map(async (att) => {
        const base64 = await fileToBase64(att.file);
        return { inlineData: { data: base64, mimeType: att.file.type } };
      }));
      const responseText = await chatWithGemini(input || (isArabic ? 'حلل هذه الوسائط' : 'Analyze this media'), mediaParts);
      const modelMsg: Message = { role: 'model', text: responseText || 'Ruby Core error.', timestamp: new Date() };
      setMessages(prev => [...prev, modelMsg]);
      setInput('');
      setAttachments([]);
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsLoading(false); 
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 animate-in fade-in duration-700 relative">
      <div className={`flex flex-col glass rounded-[2rem] overflow-hidden transition-all duration-700 relative border-red-900/10 ${previewCode ? 'lg:w-1/2' : 'w-full'}`}>
        
        {/* Messages - Adjusted padding and spacing */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 lg:px-8 space-y-8 pb-32">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] lg:max-w-[70%] rounded-[1.5rem] px-5 py-3 shadow-xl transition-all ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-red-600 to-red-800 text-white rounded-tr-none' 
                  : 'bg-red-950/20 text-red-50/90 rounded-tl-none border border-red-800/20 backdrop-blur-xl'
              }`}>
                <div className="text-[13px] md:text-sm leading-relaxed font-medium">
                   {msg.text.split(/(```[\s\S]*?```)/g).map((part, index) => {
                      if (part.startsWith('```')) {
                        const code = part.replace(/```(\w+)?/g, '').replace(/```/g, '').trim();
                        const isHTML = part.includes('html') || code.includes('<html');
                        return (
                          <div key={index} className="my-4 rounded-xl border border-red-900/30 bg-black/90 overflow-hidden shadow-lg">
                            <div className="bg-red-950/50 px-4 py-2 flex items-center justify-between border-b border-red-900/10">
                               <div className="flex items-center gap-2"><Cpu className="w-3.5 h-3.5 text-red-500" /><span className="text-[9px] font-black text-red-200 uppercase tracking-widest">Ruby Core</span></div>
                               <div className="flex gap-2">
                                  {isHTML && (
                                    <button onClick={() => setPreviewCode(code)} className="flex items-center gap-1.5 text-[9px] bg-red-600 text-white px-3 py-1.5 rounded-full hover:bg-red-500 transition-all font-black uppercase">
                                      <Layers className="w-3 h-3" /> {isArabic ? 'بناء' : 'Build'}
                                    </button>
                                  )}
                                  <button onClick={() => navigator.clipboard.writeText(code)} className="p-1.5 hover:bg-red-900/40 rounded-full text-red-400"><Copy className="w-3.5 h-3.5" /></button>
                               </div>
                            </div>
                            <pre className="p-4 text-[11px] font-mono overflow-x-auto text-red-100/80 leading-relaxed scrollbar-hide"><code>{code}</code></pre>
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
            <div className="flex justify-start">
               <div className="px-5 py-3 bg-red-950/20 rounded-full border border-red-900/20 animate-pulse flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-red-500 animate-spin" />
                  <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">{isArabic ? 'معالجة...' : 'Processing...'}</span>
               </div>
            </div>
          )}
        </div>

        {/* Compact Input Capsule */}
        <div className="absolute bottom-4 left-0 right-0 px-4 lg:px-8 flex flex-col items-center z-20 pointer-events-none">
          <div className="w-full max-w-2xl pointer-events-auto">
            
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2 animate-in slide-in-from-bottom-2 bg-black/60 p-2 rounded-2xl backdrop-blur-xl border border-red-900/20 max-h-24 overflow-y-auto">
                {attachments.map((att, i) => (
                  <div key={i} className="relative group w-12 h-12 rounded-lg overflow-hidden border border-red-500/30">
                    {att.type === 'image' ? (
                      <img src={att.preview} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-red-950/50 flex items-center justify-center">
                        {att.type === 'video' ? <Film className="w-5 h-5 text-red-500" /> : <FileCode className="w-5 h-5 text-red-400" />}
                      </div>
                    )}
                    <button 
                      onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                      className="absolute top-0.5 right-0.5 bg-red-600 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-2.5 h-2.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="glass-premium rounded-[2rem] p-1.5 flex items-end gap-1.5 border border-red-800/30 shadow-2xl bg-red-950/40 backdrop-blur-[40px]">
              
              <div className="flex items-center gap-0.5 mb-0.5">
                <button onClick={() => imageInputRef.current?.click()} className="p-2.5 text-red-400/70 hover:text-white hover:bg-red-900/40 rounded-full transition-all">
                  <ImageIcon className="w-5 h-5" />
                  <input type="file" accept="image/*" multiple ref={imageInputRef} onChange={(e) => handleFileSelection(e, 'image')} className="hidden" />
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-red-400/70 hover:text-white hover:bg-red-900/40 rounded-full transition-all">
                  <FolderOpen className="w-5 h-5" />
                  <input type="file" multiple ref={fileInputRef} onChange={(e) => handleFileSelection(e, 'file')} className="hidden" />
                </button>
              </div>

              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={isArabic ? 'أمرك...' : 'Command...'}
                className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-red-900/40 py-2.5 px-2 resize-none max-h-32 overflow-y-auto text-[13px] leading-relaxed scrollbar-hide"
              />

              <div className="flex items-center gap-1.5 pr-1 mb-0.5">
                <button onClick={startVoice} className={`p-3 rounded-full transition-all ${isVoiceActive ? 'bg-red-600 text-white shadow-lg' : 'text-red-400/70 hover:bg-red-900/30'}`}>
                  {isVoiceActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button 
                  onClick={handleSend}
                  disabled={isLoading || (!input.trim() && attachments.length === 0)}
                  className="p-3 bg-red-600 hover:bg-red-500 disabled:bg-red-950/30 text-white rounded-full transition-all group"
                >
                  <Send className={`w-5 h-5 transition-transform ${isArabic ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {previewCode && (
        <div className="lg:w-1/2 flex flex-col glass rounded-[2rem] overflow-hidden border border-red-600/30 animate-in slide-in-from-right-10 duration-700 bg-white shadow-2xl h-[80vh] lg:h-full fixed lg:relative bottom-0 left-0 right-0 z-[60]">
          <div className="bg-red-900 px-6 py-3 flex items-center justify-between">
            <h3 className="text-white font-black text-[10px] uppercase tracking-widest">{isArabic ? 'مختبر ياقوت' : 'Yaqoot Lab'}</h3>
            <button onClick={() => setPreviewCode(null)} className="p-2 hover:bg-white/20 rounded-full text-white"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 bg-white">
            <iframe title="preview" srcDoc={previewCode} className="w-full h-full border-none" sandbox="allow-scripts" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
