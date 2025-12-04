import axios from "axios";
import {
  Bot,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Circle,
  Globe,
  Loader,
  Send,
  Settings,
  Sparkles,
  X,
  Zap
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

function JobChat({ skills }) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preferences, setPreferences] = useState({ location: "", remote: false, title: "" });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialSuggestionMade, setInitialSuggestionMade] = useState(false);
  const [isPreferencesExpanded, setIsPreferencesExpanded] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(true); // Always start in fullscreen
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // Auto-suggest jobs when chat opens
  useEffect(() => {
    if (isChatOpen && skills && skills.length > 0 && !initialSuggestionMade) {
      autoSuggestJobs();
    }
    // Only run on isChatOpen, skills, and initialSuggestionMade change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChatOpen, skills]);

  const autoSuggestJobs = async () => {
    setLoading(true);
    setInitialSuggestionMade(true);
    try {
      const res = await axios.post("/api/chat", {
        message: "Find job opportunities for me based on my resume",
        skills,
        preferences,
        autoSuggest: true
      });
      setChat([
        { from: "bot", text: res.data.reply }
      ]);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Failed to fetch job suggestions");
      setChat([
        { from: "bot", text: "Hello! I'm ready to help you find job opportunities based on your resume. What type of position are you looking for?" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (customMessage = null) => {
    const messageToSend = customMessage || message.trim();
    if (!messageToSend) return;
    
    setError("");
    setLoading(true);
    
    // Clear input only if using the text input (not custom message)
    if (!customMessage) {
      setMessage("");
    }
    
    // Add user message immediately for better UX
    setChat(prevChat => [...prevChat, { from: "user", text: messageToSend }]);
    
    try {
      const res = await axios.post("/api/chat", {
        message: messageToSend,
        skills,
        preferences
      });
      setChat(prevChat => [...prevChat, { from: "bot", text: res.data.reply }]);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Chat error");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isChatOpen) {
    return (
      <button
        onClick={() => setIsChatOpen(true)}
        disabled={!skills || skills.length === 0}
        className={`group relative flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-bold transition-all transform text-xl shadow-2xl ${
          skills && skills.length > 0 
            ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 hover:scale-105 hover:shadow-3xl animate-pulse' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        <Sparkles className="w-7 h-7 animate-pulse" />
        <span>{skills && skills.length > 0 ? 'Launch AI Job Hunter' : 'Upload Resume First'}</span>
        <Zap className="w-7 h-7 animate-pulse" />
        {skills && skills.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
          </span>
        )}
      </button>
    );
  }

  // Chat content component
  const chatContent = (
    <div className={`bg-white shadow-2xl overflow-hidden transition-all duration-300 flex flex-col ${
      isFullscreen 
        ? 'fixed inset-4 z-[9999] rounded-2xl' 
        : 'rounded-3xl max-w-6xl mx-auto max-h-[90vh]'
    }`}>
        {/* Chat Header - Compact */}
        <div className="p-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 border-b border-indigo-700 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bot className="w-6 h-6 text-white" />
              <Circle className="w-2 h-2 text-green-400 fill-green-400 absolute -bottom-0.5 -right-0.5 animate-pulse" />
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                Job Hunter AI
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full font-semibold border border-white/30">
                  BETA
                </span>
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* <button 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-all text-white hover:scale-110"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button> */}
            <button 
              onClick={() => setIsChatOpen(false)} 
              className="p-2 hover:bg-white/10 rounded-lg transition-all text-white hover:scale-110"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

      {/* Modal Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Preferences Section - Collapsible & Compact */}
        <div className="border-b border-gray-200 bg-gradient-to-br from-slate-50 to-gray-100 flex-shrink-0">
          <button 
            onClick={() => setIsPreferencesExpanded(!isPreferencesExpanded)}
            className="w-full p-2 flex justify-between items-center hover:bg-gray-50/50 transition-colors"
          >
            <h4 className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
              <Settings className="w-4 h-4 text-indigo-600" />
              Filters
              {(preferences.title || preferences.location || preferences.remote) && (
                <span className="bg-indigo-100 text-indigo-700 text-xs px-1.5 py-0.5 rounded-full font-semibold">
                  Active
                </span>
              )}
            </h4>
            {isPreferencesExpanded ? 
              <ChevronUp className="w-4 h-4 text-gray-600" /> : 
              <ChevronDown className="w-4 h-4 text-gray-600" />
            }
          </button>
          
          {isPreferencesExpanded && (
            <div className="px-3 pb-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm transition-all focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 hover:border-gray-400"
                  value={preferences.title}
                  onChange={(e) => setPreferences(p => ({ ...p, title: e.target.value }))}
                  placeholder="Target Role (e.g., Software Engineer)"
                />
                <input
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm transition-all focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 hover:border-gray-400"
                  value={preferences.location}
                  onChange={(e) => setPreferences(p => ({ ...p, location: e.target.value }))}
                  placeholder="Location (e.g., Remote, NYC)"
                />
              </div>
              <label className="flex items-center gap-2 text-xs cursor-pointer p-2 bg-white hover:bg-indigo-50 rounded-lg transition-all border border-transparent hover:border-indigo-200 group">
                <input 
                  type="checkbox" 
                  checked={preferences.remote} 
                  onChange={(e) => setPreferences(p => ({ ...p, remote: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <Globe className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-gray-700 flex-1">Remote only</span>
              </label>
              
              {/* Search with Filters Button - Compact */}
              <button
                onClick={() => {
                  const searchMessage = preferences.title 
                    ? `Find ${preferences.title} jobs${preferences.location ? ` in ${preferences.location}` : ''}${preferences.remote ? ' (remote only)' : ''}`
                    : `Find jobs${preferences.location ? ` in ${preferences.location}` : ''}${preferences.remote ? ' (remote only)' : ''}`;
                  
                  sendMessage(searchMessage);
                }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-bold shadow-md hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                Search with Filters
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Skills Summary - Compact */}
        {skills && skills.length > 0 && (
          <div className="p-2 bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-indigo-100">
            <div className="flex flex-wrap gap-1">
              {skills.slice(0, 8).map((skill, i) => (
                <span 
                  key={i} 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs px-2 py-1 rounded-full font-semibold"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 8 && (
                <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  +{skills.length - 8} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Chat Messages - Expanded */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
          <div className="p-3 space-y-3 min-h-full">
            {chat.length === 0 && !loading && (
              <div className="text-center text-gray-500 py-16 space-y-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <Briefcase className="w-24 h-24 text-indigo-200" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-indigo-400 animate-pulse" />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-lg mb-2">AI is analyzing your resume...</p>
                  <p className="text-sm text-gray-600 max-w-md mx-auto">
                    Searching for job opportunities that perfectly match your skills and experience
                  </p>
                </div>
                <div className="flex justify-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            {chat.map((c, i) => (
              <div key={i} className={`flex ${c.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`group relative rounded-xl p-3 shadow-md max-w-[85%] transition-all hover:shadow-lg ${
                  c.from === 'user' 
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-md' 
                    : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
                }`}>
                  <div className={`flex items-center gap-1.5 text-xs font-bold mb-1.5 ${
                    c.from === 'user' ? 'text-indigo-100' : 'text-gray-500'
                  }`}>
                    {c.from === 'user' ? (
                      <>
                        <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs">
                          👤
                        </div>
                        You
                      </>
                    ) : (
                      <>
                        <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Bot className="w-3 h-3 text-indigo-600" />
                        </div>
                        AI
                        <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs">●</span>
                      </>
                    )}
                  </div>
                  <div className={`text-sm leading-relaxed markdown-content ${
                    c.from === 'user' ? 'text-white' : 'text-gray-800'
                  }`}>
                    <ReactMarkdown
                      rehypePlugins={[rehypeSanitize]}
                      components={{
                        a: ({ node, ...props }) => (
                          <a 
                            {...props} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`underline font-semibold hover:opacity-80 transition-all cursor-pointer ${
                              c.from === 'user' 
                                ? 'text-blue-200 hover:text-blue-100' 
                                : 'text-blue-600 hover:text-blue-700'
                            }`}
                            style={{ textDecorationThickness: '2px' }}
                          />
                        ),
                        code: ({ node, inline, ...props }) => 
                          inline ? (
                            <code {...props} className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                              c.from === 'user' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-800'
                            }`} />
                          ) : (
                            <pre className={`block px-3 py-2 rounded-lg text-xs font-mono my-2 overflow-x-auto ${
                              c.from === 'user' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-800'
                            }`}>
                              <code {...props} />
                            </pre>
                          ),
                      }}
                    >
                      {c.text}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-xl rounded-bl-md p-3 shadow-md border border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Loader className="w-4 h-4 animate-spin text-indigo-600" />
                    <span className="text-sm font-medium">Searching...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>

      {/* Input Section - Footer - Compact */}
      <div className="p-3 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-t border-indigo-200 flex-shrink-0">
        {error && (
          <div className="mb-2 p-2 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-xs font-semibold flex items-center gap-2">
            <X className="w-4 h-4" />
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm transition-all focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100 resize-none hover:border-gray-400"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask me to find jobs..."
            disabled={loading}
            onKeyDown={handleKeyPress}
            rows={2}
          />
          <button 
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md ${
              loading || !message.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg transform hover:scale-105'
            }`}
            onClick={sendMessage} 
            disabled={loading || !message.trim()}
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline text-xs">Wait...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Send</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Render chat content
  if (!isChatOpen) {
    return (
      <button
        onClick={() => setIsChatOpen(true)}
        disabled={!skills || skills.length === 0}
        className={`relative flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl transform ${
          skills && skills.length > 0
            ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 hover:scale-105 hover:shadow-3xl animate-pulse'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        <Sparkles className="w-7 h-7" />
        <span>{skills && skills.length > 0 ? 'Launch AI Job Hunter' : 'Upload Resume First'}</span>
        <Zap className="w-7 h-7 animate-pulse" />
        {skills && skills.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
          </span>
        )}
      </button>
    );
  }

  return (
    <>
      {isChatOpen && createPortal(
        <>
          {/* Fullscreen backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] transition-opacity duration-300"
            onClick={() => {
              setIsChatOpen(false);
              setIsFullscreen(true); // Reset for next open
            }}
          />
          {chatContent}
        </>,
        document.body
      )}
    </>
  );
}

export default JobChat;