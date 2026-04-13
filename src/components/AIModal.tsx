import React, { useState, useMemo, useRef, memo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, X, Plus, Menu, Image as ImageIcon, Trash2, ChevronDown } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GoogleGenAI } from "@google/genai";
import { GameStats, ChatSession, ChatMessage } from '../types';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  setStats: React.Dispatch<React.SetStateAction<GameStats>>;
  t: any;
}

const MessageItem = memo(({ msg, t }: { msg: ChatMessage, t: any }) => (
  <motion.div
    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
    animate={{ opacity: 1, x: 0 }}
    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
  >
    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
      msg.role === 'user' 
        ? 'bg-indigo-500 text-white rounded-tr-none' 
        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'
    }`}>
      {msg.image && (
        <img 
          src={msg.image} 
          alt="Uploaded" 
          className="w-full max-h-48 object-cover rounded-lg mb-2 border border-white/10"
          referrerPolicy="no-referrer"
        />
      )}
      <div className="markdown-body">
        <Markdown remarkPlugins={[remarkGfm]}>{msg.text}</Markdown>
      </div>
    </div>
  </motion.div>
));

const ChatInput = memo(({ 
  onSubmit, 
  isAILoading, 
  t, 
  aiImage, 
  setAiImage, 
  fileInputRef, 
  handleImageUpload 
}: { 
  onSubmit: (text: string) => void, 
  isAILoading: boolean, 
  t: any,
  aiImage: string | null,
  setAiImage: (img: string | null) => void,
  fileInputRef: React.RefObject<HTMLInputElement>,
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => {
  const [localInput, setLocalInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!localInput.trim() && !aiImage) || isAILoading) return;
    onSubmit(localInput);
    setLocalInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-slate-800/50">
      {aiImage && (
        <div className="mb-3 relative inline-block">
          <img 
            src={aiImage} 
            alt="Preview" 
            className="w-20 h-20 object-cover rounded-xl border-2 border-indigo-500 shadow-lg"
            referrerPolicy="no-referrer"
          />
          <button
            type="button"
            onClick={() => setAiImage(null)}
            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={localInput}
          onChange={(e) => setLocalInput(e.target.value)}
          placeholder={t.aiPlaceholder}
          className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 bg-slate-900 border border-white/10 hover:border-indigo-500/50 rounded-xl transition-all text-slate-400 hover:text-indigo-400"
          title={t.aiUploadImage}
        >
          <ImageIcon className="w-5 h-5" />
        </button>
        <button
          type="submit"
          disabled={(!localInput.trim() && !aiImage) || isAILoading}
          className="p-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:hover:bg-indigo-500 rounded-xl transition-all active:scale-95"
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </form>
  );
});

export default function AIModal({ isOpen, onClose, stats, setStats, t }: AIModalProps) {
  const [isAILoading, setIsAILoading] = useState(false);
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Show button if we are more than 200px from the bottom
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 200;
    setShowScrollButton(isScrolledUp);
  };

  const activeSession = useMemo(() => {
    return stats.chatSessions.find(s => s.id === stats.activeChatId) || null;
  }, [stats.chatSessions, stats.activeChatId]);

  React.useEffect(() => {
    if (!showScrollButton) {
      scrollToBottom();
    }
  }, [activeSession?.messages.length]);

  const createNewChat = () => {
    const newChat: ChatSession = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: `${t.aiChatTitle} ${stats.chatSessions.length + 1}`,
      messages: [],
      createdAt: Date.now()
    };
    setStats(prev => ({
      ...prev,
      chatSessions: [newChat, ...prev.chatSessions],
      activeChatId: newChat.id
    }));
    setIsAISidebarOpen(false);
  };

  const deleteChat = (id: string) => {
    setStats(prev => {
      const newSessions = prev.chatSessions.filter(s => s.id !== id);
      let newActiveId = prev.activeChatId;
      if (newActiveId === id) {
        newActiveId = newSessions.length > 0 ? newSessions[0].id : null;
      }
      return {
        ...prev,
        chatSessions: newSessions,
        activeChatId: newActiveId
      };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        alert(stats.language === 'ar' ? 'يجب أن يكون حجم الصورة أقل من 1 ميجابايت' : 'Image size must be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAiImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAISubmit = async (text: string) => {
    if ((!text.trim() && !aiImage) || isAILoading) return;

    let currentSessionId = stats.activeChatId;
    if (!currentSessionId) {
      const newChat: ChatSession = {
        id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        title: `${t.aiChatTitle} 1`,
        messages: [],
        createdAt: Date.now()
      };
      currentSessionId = newChat.id;
      setStats(prev => ({
        ...prev,
        chatSessions: [newChat, ...prev.chatSessions],
        activeChatId: newChat.id
      }));
    }

    const userMessage = text.trim();
    const userImage = aiImage;
    setAiImage(null);
    
    // Optimistically update UI
    setStats(prev => ({
      ...prev,
      chatSessions: prev.chatSessions.map(s => 
        s.id === currentSessionId 
          ? { ...s, messages: [...s.messages, { id: `msg_${Date.now()}_u_${Math.random().toString(36).substr(2, 5)}`, role: 'user', text: userMessage, image: userImage || undefined }] }
          : s
      )
    }));
    
    setIsAILoading(true);

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timed out after 30 seconds')), 30000)
    );

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error('Gemini API Key is missing. Please set GEMINI_API_KEY in your environment.');
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const session = stats.chatSessions.find(s => s.id === currentSessionId);
      const messages = session ? session.messages : [];
      
      // Build history from previous messages, ensuring alternating roles
      const contents: any[] = [];
      
      // Filter history to ensure it starts with a user message and alternates correctly
      const historyMessages = messages.slice(-10);
      let startIndex = 0;
      while (startIndex < historyMessages.length && historyMessages[startIndex].role !== 'user') {
        startIndex++;
      }

      const validHistory = historyMessages.slice(startIndex);
      
      validHistory.forEach((m, idx) => {
        const parts: any[] = [];
        if (m.text) parts.push({ text: m.text });
        
        // Only include images for the last 2 messages in history to save bandwidth/tokens
        const isRecentImage = idx >= validHistory.length - 2;
        if (isRecentImage && m.image && m.image.includes(',')) {
          try {
            const [header, data] = m.image.split(',');
            const mimeType = header.split(';')[0].split(':')[1];
            parts.push({
              inlineData: {
                mimeType,
                data
              }
            });
          } catch (e) {
            console.error('Error parsing historical image data:', e);
          }
        }
        
        if (parts.length > 0) {
          // Ensure alternating roles
          if (contents.length > 0 && contents[contents.length - 1].role === m.role) {
            contents[contents.length - 1].parts.push(...parts);
          } else {
            contents.push({ role: m.role, parts });
          }
        }
      });
      
      // Add current message
      const currentParts: any[] = [];
      if (userMessage) currentParts.push({ text: userMessage });
      if (userImage && userImage.includes(',')) {
        try {
          const [header, data] = userImage.split(',');
          const mimeType = header.split(';')[0].split(':')[1];
          currentParts.push({
            inlineData: {
              mimeType,
              data
            }
          });
        } catch (e) {
          console.error('Error parsing current image data:', e);
        }
      }

      if (currentParts.length === 0) {
        currentParts.push({ text: "Analyze this" });
      }

      // Append current user message to contents
      if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
        contents[contents.length - 1].parts.push(...currentParts);
      } else {
        contents.push({ role: 'user', parts: currentParts });
      }

      // Build dynamic system instruction with current player stats and leaderboard
      const sortedLeaderboard = [...stats.leaderboard].sort((a, b) => b.score - a.score);
      const playerRank = sortedLeaderboard.findIndex(e => e.isPlayer) + 1;
      
      const leaderboardContext = sortedLeaderboard.map((entry, idx) => 
        `${idx + 1}. ${entry.name}${entry.isPlayer ? ' (YOU)' : ''}: ${entry.score} pts`
      ).join('\n');

      const inboxContext = stats.inbox.length > 0 
        ? stats.inbox.map(item => 
            `- [${item.isClaimed ? 'CLAIMED' : 'UNCLAIMED'}] ${item.title}: ${item.description} (Source: ${item.source || 'Unknown'})`
          ).join('\n')
        : (stats.language === 'ar' ? 'البريد فارغ حالياً.' : 'Inbox is currently empty.');

      const dynamicContext = stats.language === 'ar' 
        ? `\n\nسياق اللاعب الحالي:
- الدوري الحالي: ${stats.currentLeague}
- الموسم: ${stats.season}
- المركز الحالي: ${playerRank} من ${stats.leaderboard.length}
- أعلى نتيجة (في جولة واحدة): ${stats.highScore}
- العملات: ${stats.coins}
- النجوم الإجمالية: ${stats.totalStars}

لوحة الصدارة (تعتمد على النقاط المجمّعة من كل الجولات):
${leaderboardContext}

حالة البريد الوارد:
${inboxContext}`
        : `\n\nPlayer Current Context:
- Current League: ${stats.currentLeague}
- Season: ${stats.season}
- Current Rank: ${playerRank} out of ${stats.leaderboard.length}
- High Score (Single Round): ${stats.highScore}
- Coins: ${stats.coins}
- Total Stars: ${stats.totalStars}

Leaderboard (Based on CUMULATIVE points from all rounds):
${leaderboardContext}

Inbox Status:
${inboxContext}`;

      const systemInstruction = (t.aiSystemPrompt || "You are a helpful assistant.") + dynamicContext;

      // Use gemini-3.1-flash-lite-preview as it might have better availability for this key
      const response = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-preview',
          contents,
          config: {
            systemInstruction: systemInstruction,
          }
        }),
        timeoutPromise
      ]) as any;

      if (!response || !response.text) {
        throw new Error('Empty response from AI');
      }

      const aiResponse = response.text;
      
      setStats(prev => ({
        ...prev,
        chatSessions: prev.chatSessions.map(s => 
          s.id === currentSessionId 
            ? { 
                ...s, 
                messages: [...s.messages, { id: `msg_${Date.now()}_m_${Math.random().toString(36).substr(2, 5)}`, role: 'model', text: aiResponse }],
                title: s.messages.length === 0 ? (userMessage || 'Image Analysis').slice(0, 20) + (userMessage.length > 20 ? '...' : '') : s.title
              }
            : s
        )
      }));
    } catch (error) {
      console.error('AI Error Details:', error);
      let errorMessage = t.aiError;
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = stats.language === 'ar' ? 'خطأ في مفتاح API. يرجى التحقق من الإعدادات.' : 'API Key error. Please check settings.';
        } else if (error.message.includes('fetch')) {
          errorMessage = stats.language === 'ar' ? 'خطأ في الاتصال بالخادم. يرجى التحقق من الإنترنت.' : 'Connection error. Please check your internet.';
        } else {
          errorMessage = `${t.aiError}\n\n*${error.message}*`;
        }
      }
      
      setStats(prev => ({
        ...prev,
        chatSessions: prev.chatSessions.map(s => 
          s.id === currentSessionId 
            ? { ...s, messages: [...s.messages, { id: `msg_${Date.now()}_e_${Math.random().toString(36).substr(2, 5)}`, role: 'model', text: errorMessage }] }
            : s
        )
      }));
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="bg-slate-900 w-full max-w-2xl h-[80vh] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col relative"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-800/50">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAISidebarOpen(!isAISidebarOpen)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <Bot className="text-indigo-400 w-6 h-6" />
                  <h2 className="font-bold text-lg">{activeSession?.title || t.aiAssistant}</h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
              {/* Sidebar */}
              <AnimatePresence>
                {isAISidebarOpen && (
                  <motion.div
                    initial={{ x: -280 }}
                    animate={{ x: 0 }}
                    exit={{ x: -280 }}
                    className="absolute inset-y-0 left-0 w-64 bg-slate-800 border-r border-white/10 z-10 flex flex-col shadow-2xl"
                  >
                    <div className="p-4 border-b border-white/5">
                      <button
                        onClick={createNewChat}
                        className="w-full py-2 px-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        {t.aiNewChat}
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                      {stats.chatSessions.length === 0 && (
                        <p className="text-xs text-slate-500 text-center mt-4">{t.aiNoChats}</p>
                      )}
                      {stats.chatSessions.map(session => (
                        <div
                          key={session.id}
                          className={`group flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-all ${
                            stats.activeChatId === session.id ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/5 text-slate-400'
                          }`}
                          onClick={() => {
                            setStats(prev => ({ ...prev, activeChatId: session.id }));
                            setIsAISidebarOpen(false);
                          }}
                        >
                          <Bot className="w-4 h-4 flex-shrink-0" />
                          <span className="flex-1 truncate text-xs font-medium">{session.title}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChat(session.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col overflow-hidden relative">
                <div 
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
                >
                  {(!activeSession || activeSession.messages.length === 0) && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                      <Bot className="w-12 h-12 mb-4" />
                      <p className="text-sm">{t.aiAssistantDesc}</p>
                    </div>
                  )}
                  {activeSession?.messages.map((msg) => (
                    <MessageItem key={msg.id} msg={msg} t={t} />
                  ))}
                  {isAILoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-800 text-slate-400 p-3 rounded-2xl rounded-tl-none border border-white/5 text-xs animate-pulse">
                        {t.aiThinking}
                      </div>
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {showScrollButton && (
                    <motion.button
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.8 }}
                      onClick={scrollToBottom}
                      className="absolute bottom-24 right-6 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-full shadow-2xl z-20 transition-all active:scale-90 border border-white/20 flex items-center gap-2 font-bold text-xs group"
                    >
                      <span>{t.aiScrollToBottom || (stats.language === 'ar' ? 'الذهاب لآخر رسالة' : 'Go to last message')}</span>
                      <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                    </motion.button>
                  )}
                </AnimatePresence>

                <ChatInput 
                  onSubmit={handleAISubmit}
                  isAILoading={isAILoading}
                  t={t}
                  aiImage={aiImage}
                  setAiImage={setAiImage}
                  fileInputRef={fileInputRef}
                  handleImageUpload={handleImageUpload}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
