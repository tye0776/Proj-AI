import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Key, AlertCircle, Loader2, Bot, User, ArrowRight } from 'lucide-react';

import { getProducts, getSales, getApiKey, saveApiKey, getAdvisorHistory, saveAdvisorHistory } from '../services/store';

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export const Advisor = () => {
  const [apiKey, setApiKey] = useState(getApiKey());
  const [isKeySet, setIsKeySet] = useState(!!getApiKey() && getApiKey().startsWith('sk-'));
  const [messages, setMessages] = useState<Message[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isKeySet) {
      const history = getAdvisorHistory();
      if (history.length > 1) { // More than just the initial greeting
        setShowWelcome(true);
      } else {
        startFreshConversation();
      }
    }
  }, [isKeySet]);

  const startFreshConversation = () => {
    const initialMessages: Message[] = [
      { 
        role: 'assistant', 
        content: "Hello! I'm Jane, your ProfitMate Business Advisor. I have analyzed your recent sales and product data. Ask me anything about your business performance, what to promote, or how to increase your margins!" 
      }
    ];
    setMessages(initialMessages);
    saveAdvisorHistory(initialMessages);
    setShowWelcome(false);
  };

  const continueConversation = () => {
    setMessages(getAdvisorHistory());
    setShowWelcome(false);
  };

  const handleSetKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim().startsWith('sk-')) {
      saveApiKey(apiKey.trim());
      setIsKeySet(true);
      setError('');
    } else {
      setError('Please enter a valid OpenRouter API Key starting with "sk-"');
    }
  };

  const generateBusinessContext = () => {
    const products = getProducts();
    const sales = getSales();
    
    return `
You are Jane, the ProfitMate Business Advisor, an expert business advisor for a small business.
Here is the current business data:
PRODUCTS:
${JSON.stringify(products.map(p => ({ name: p.name, cost: p.costPrice, price: p.sellingPrice, margin: p.sellingPrice - p.costPrice })), null, 2)}

RECENT SALES:
${JSON.stringify(sales.slice(0, 50).map(s => ({ product: products.find(p=>p.id===s.productId)?.name, quantity: s.quantity, date: s.date })), null, 2)}

Provide concise, actionable business advice based on this data. YOUR ABSOLUTE PRIORITY IS INCREASING THE USER'S PROFITS. Every piece of advice you give must be laser-focused on maximizing margins, reducing costs, or driving high-profit sales. Keep responses friendly, professional, and short (1-2 paragraphs).
`;
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setError('');
    
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMsg }
    ];
    setMessages(newMessages);
    saveAdvisorHistory(newMessages);
    setIsLoading(true);

    try {
      const systemMessage: Message = { role: 'system', content: generateBusinessContext() };
      const apiMessages = [systemMessage, ...newMessages];

      if (apiKey === 'demo-mode') {
        const products = getProducts();
        const bestProduct = products.length > 0 ? products.reduce((prev, current) => (prev.sellingPrice - prev.costPrice > current.sellingPrice - current.costPrice) ? prev : current) : null;
        const margin = bestProduct ? bestProduct.sellingPrice - bestProduct.costPrice : 0;
        const mockResponse = bestProduct 
          ? `I've analyzed your data! Your highest margin product right now is **${bestProduct.name}** with a profit of ₦${margin.toLocaleString()} per unit.\n\nConsider running a 2-for-1 promotion on it today to drive volume against your lower-margin items!`
          : "I'm analyzing your data... You should add some products with healthy margins so I can give you specific advice!";
        
        setTimeout(() => {
          const finalMessages: Message[] = [...newMessages, { role: 'assistant', content: mockResponse }];
          setMessages(finalMessages);
          saveAdvisorHistory(finalMessages);
          setIsLoading(false);
        }, 1500);
        return;
      }

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: apiMessages,
          temperature: 0.7,
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || 'Failed to fetch AI response');
      }

      const data = await res.json();
      const aiContent = data.choices[0].message.content;

      const finalMessages: Message[] = [...newMessages, { role: 'assistant', content: aiContent }];
      setMessages(finalMessages);
      saveAdvisorHistory(finalMessages);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while connecting to OpenRouter.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isKeySet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 max-w-md w-full text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Business Advisor</h1>
          <p className="text-slate-500 mb-8">Enter your OpenRouter API key to chat with Jane and get personalized business insights.</p>
          
          <form onSubmit={handleSetKey} className="space-y-4">
            <div className="relative text-left">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1 block">OpenRouter API Key</label>
              <div className="relative">
                <Key className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm"
                />
              </div>
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            <button
              type="submit"
              className="w-full py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              Start Advisor Session
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium uppercase tracking-wider">or</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>
            
            <button
              type="button"
              onClick={() => {
                saveApiKey('demo-mode');
                setIsKeySet(true);
                setError('');
              }}
              className="w-full py-3 bg-indigo-50 text-indigo-700 font-semibold border-2 border-indigo-100 rounded-xl hover:bg-indigo-100 hover:border-indigo-200 transition-all shadow-sm"
            >
              Play with Demo Mode
            </button>

            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              Your key is never saved. It is only kept in memory for this session and sent directly to OpenRouter.
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-600" />
          Business Advisor
        </h1>
        <div className="flex justify-between items-center w-full mt-1">
          <p className="text-slate-500 text-sm">Ask questions about your sales, products, and margins</p>
          {!showWelcome && messages.length > 1 && (
            <button 
              onClick={startFreshConversation}
              className="text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
            >
              Clear & Start Fresh
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {showWelcome ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Bot className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Welcome Back!</h2>
            <p className="text-slate-500 mb-8 max-w-md">I remember our previous conversation. Would you like to continue where we left off, or start a new analysis based on your latest data?</p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <button
                onClick={continueConversation}
                className="flex-1 py-3 px-4 bg-white border-2 border-indigo-600 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
              >
                Continue Chat
              </button>
              <button
                onClick={startFreshConversation}
                className="flex-1 py-3 px-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-md transition-all flex items-center justify-center gap-2"
              >
                Start Fresh
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-12 text-left w-full max-w-md">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Suggested Prompts</p>
              <div className="space-y-2">
                <button 
                  onClick={() => { setInput("Which pastry should I promote today based on my highest margins?"); startFreshConversation(); }}
                  className="w-full text-left p-3 text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-100 transition-colors"
                >
                  "Which pastry should I promote today based on my highest margins?"
                </button>
                <button 
                  onClick={() => { setInput("Summarize my sales performance for the last 7 days."); startFreshConversation(); }}
                  className="w-full text-left p-3 text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-100 transition-colors"
                >
                  "Summarize my sales performance for the last 7 days."
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex gap-4 max-w-[85%] sm:max-w-[75%] ${message.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 
                ${message.role === 'user' ? 'bg-slate-100 text-slate-600' : 'bg-indigo-50 text-indigo-600'}`}>
                {message.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm
                ${message.role === 'user' 
                  ? 'bg-slate-900 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-100 rounded-tl-none font-medium'
                }`}
              >
                {message.role === 'user' ? (
                  message.content.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))
                ) : (
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/\n/g, '<br />')
                    }} 
                    className="space-y-2"
                  />
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4 max-w-[85%] sm:max-w-[75%]">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-indigo-50 text-indigo-600">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-100 rounded-tl-none shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="p-4 bg-slate-50 border-t border-slate-100">
          {error && (
            <div className="mb-3 px-4 py-2 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          <form onSubmit={sendMessage} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Jane for advice..."
              className="flex-1 w-full min-w-0 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm text-sm sm:text-base placeholder-slate-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
