import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Mic, SquareSquare, Volume2, ShieldAlert, WifiOff } from "lucide-react";
import { OFFLINE_AI_GUIDES } from "../../lib/offlineStore";

export function FirstAidChat({ category }: { category: string | null }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([
    { 
      role: 'model', 
      content: category 
        ? `I am the AI First Aid Assistant. You selected "${category}". Please describe the situation or ask for step-by-step guidance. If this is life-threatening, call emergency services immediately.` 
        : `I am the AI First Aid Assistant. Please describe the emergency or symptoms clearly. If this is life-threatening, call emergency services immediately.` 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Speech Recognition (Browser API)
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const findOfflineGuideResponse = (queryText: string, catText: string | null) => {
    const text = (queryText + " " + (catText || "")).toLowerCase();
    
    let matchedGuide = OFFLINE_AI_GUIDES.find(g => 
      text.includes(g.id) || 
      g.title.toLowerCase().split(" ").some(word => word.length > 3 && text.includes(word))
    );

    if (!matchedGuide) {
      matchedGuide = OFFLINE_AI_GUIDES[0]; // CPR default
    }

    return `🔴 [OFFLINE AI MANUAL MODE - ${matchedGuide.title}]

📋 Step-by-Step Emergency Response:
${matchedGuide.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}

⚠️ Precaution:
${matchedGuide.precautions}

(Offline guide retrieved from local IndexedDB cache. Call 108 or 112 immediately if condition worsens.)`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    if (!navigator.onLine) {
      setTimeout(() => {
        const offlineReply = findOfflineGuideResponse(userMsg, category);
        setMessages(prev => [...prev, { role: 'model', content: offlineReply }]);
        speakText(offlineReply.replace(/[*#]/g, ''));
        setIsLoading(false);
      }, 300);
      return;
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, { role: 'user', content: userMsg }],
          emergencyType: category 
        })
      });
      
      const data = await response.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'model', content: data.reply }]);
        speakText(data.reply);
      } else {
        const offlineReply = findOfflineGuideResponse(userMsg, category);
        setMessages(prev => [...prev, { role: 'model', content: offlineReply }]);
      }
    } catch (error) {
      console.warn("First aid API offline fallback:", error);
      const offlineReply = findOfflineGuideResponse(userMsg, category);
      setMessages(prev => [...prev, { role: 'model', content: offlineReply }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' 
                : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
            </div>
            
            <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 rounded-tl-none border border-surface-200 dark:border-surface-700'
            }`}>
              {msg.content}
              {msg.role === 'model' && (
                <button 
                  onClick={() => speakText(msg.content)}
                  className="mt-3 flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:opacity-80 transition-opacity"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  READ ALOUD
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white dark:bg-surface-800 p-4 rounded-2xl rounded-tl-none border border-surface-200 dark:border-surface-700 flex gap-1.5 items-center">
               <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
               <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
               <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/50">
        <div className="relative flex items-center gap-2">
          <button 
            onClick={toggleListen}
            className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-colors ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-700'
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>
          
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? "Listening..." : "Describe the situation..."}
            className="flex-1 h-12 px-4 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
          />
          
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 shrink-0 rounded-xl bg-primary-600 disabled:opacity-50 hover:bg-primary-700 text-white flex items-center justify-center transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
