import React, { useState, useRef, useEffect } from 'react';

export default function Chat({ setView }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I'm your AI Insurance Copilot. I can answer questions about your uploaded insurance policy, explain coverage, waiting periods, required documents, and guide you through the insurance claim process.",
      sources: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSources, setShowSources] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: query }]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query, user_id: 1 })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Error getting response.');

      setMessages(prev => [...prev, {
        sender: 'ai',
        text: data.answer,
        sources: data.retrieved_context || []
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: `Error connecting to RAG server: ${error.message}. Please verify uvicorn is running.`,
        sources: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const toggleSources = (index) => {
    setShowSources(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const quickQuestions = [
    "Is knee surgery covered?",
    "What documents are required?",
    "How do I submit my claim?",
    "What is the waiting period?",
    "What is the reimbursement limit?"
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-80px)] flex flex-col">
      {/* Back button */}
      <div className="flex-shrink-0 mb-4 flex justify-between items-center">
        <button 
          onClick={() => setView('dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-all text-sm cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
        <span className="text-xs text-purple-400 font-mono flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
          RAG Pipeline Active
        </span>
      </div>

      {/* Main chat window */}
      <div className="glass-panel flex-1 rounded-2xl flex flex-col overflow-hidden min-h-0">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-900 bg-slate-950/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-400 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Policy Copilot Chat</h3>
              <p className="text-xs text-slate-400">FAISS Vector Search + Gemini LLM</p>
            </div>
          </div>
        </div>

        {/* Message area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-base leading-relaxed shadow-lg whitespace-pre-wrap ${
                  msg.sender === 'user' 
                    ? 'bg-purple-600 text-white rounded-tr-none' 
                    : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>

              {/* RAG Sources block */}
              {msg.sender === 'ai' && msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 ml-1 w-full max-w-[85%]">
                  <button 
                    onClick={() => toggleSources(idx)}
                    className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transform transition-transform ${showSources[idx] ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {showSources[idx] ? 'Hide policy references' : `Show retrieved policy references (${msg.sources.length})`}
                  </button>

                  {showSources[idx] && (
                    <div className="mt-1.5 p-3 bg-slate-950/40 border border-slate-900 rounded-xl space-y-2 max-h-48 overflow-y-auto text-xs text-slate-400 leading-relaxed font-mono">
                      {msg.sources.map((src, sIdx) => (
                        <div key={sIdx} className="p-2 bg-slate-950/80 rounded border border-slate-900">
                          <span className="text-purple-400 font-semibold block mb-1">Chunk #{sIdx + 1} Match</span>
                          {src}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="bg-slate-900 border border-slate-800 text-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-lg">
                <div className="flex items-center gap-1.5 py-1">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt options */}
        {messages.length === 1 && !loading && (
          <div className="px-6 pb-2">
            <span className="text-xs text-slate-500 font-bold block mb-2 uppercase tracking-wider">Suggested Queries:</span>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, qIdx) => (
                <button
                  key={qIdx}
                  onClick={() => handleSend(q)}
                  className="text-sm px-4 py-2 bg-slate-950/40 border border-slate-900 hover:border-purple-500/30 text-slate-300 hover:text-white rounded-lg cursor-pointer transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input box */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/20">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              placeholder="Ask a question about the policy coverage..."
              className="flex-1 px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all text-base"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/30 text-white rounded-xl flex items-center justify-center cursor-pointer transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
