import axios from "axios";
import {
  Bot,
  Briefcase,
  Building2,
  ChevronDown,
  ChevronUp,
  Circle,
  Globe,
  Loader,
  MapPin,
  Maximize2,
  Minimize2,
  Send,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
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
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  const sendMessage = async () => {
    if (!message.trim()) return;
    setError("");
    setLoading(true);
    const userMessage = message; // Capture message before clearing input
    setMessage(""); // Clear input immediately
    
    // Add user message immediately for better UX
    setChat(prevChat => [...prevChat, { from: "user", text: userMessage }]);
    
    try {
      const res = await axios.post("/api/chat", {
        message: userMessage,
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
        {/* Chat Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 border-b border-indigo-700 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot className="w-9 h-9 text-white" />
              <Circle className="w-3 h-3 text-green-400 fill-green-400 absolute -bottom-0.5 -right-0.5 animate-pulse" />
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-2xl font-bold text-white">
                Job Hunter AI
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-semibold border border-white/30">
                  BETA
                </span>
              </h3>
              <p className="text-indigo-100 text-sm flex items-center gap-1.5 mt-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Powered by AI • Real-time job matching
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2.5 hover:bg-white/10 rounded-lg transition-all text-white hover:scale-110"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setIsChatOpen(false)} 
              className="p-2.5 hover:bg-white/10 rounded-lg transition-all text-white hover:scale-110"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

      {/* Modal Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Preferences Section - Collapsible */}
        <div className="border-b border-gray-200 bg-gradient-to-br from-slate-50 to-gray-100 flex-shrink-0">
          <button 
            onClick={() => setIsPreferencesExpanded(!isPreferencesExpanded)}
            className="w-full p-5 flex justify-between items-center hover:bg-gray-50/50 transition-colors"
          >
            <h4 className="flex items-center gap-2 text-base font-bold text-gray-800">
              <Settings className="w-5 h-5 text-indigo-600" />
              Job Search Preferences
              {(preferences.title || preferences.location || preferences.remote) && (
                <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                  Active
                </span>
              )}
            </h4>
            {isPreferencesExpanded ? 
              <ChevronUp className="w-5 h-5 text-gray-600" /> : 
              <ChevronDown className="w-5 h-5 text-gray-600" />
            }
          </button>
          
          {isPreferencesExpanded && (
            <div className="px-6 pb-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-indigo-600" />
                    Target Role
                  </label>
                  <input
                    className="px-4 py-3 border-2 border-gray-300 rounded-xl text-sm transition-all focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 hover:border-gray-400"
                    value={preferences.title}
                    onChange={(e) => setPreferences(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g., Software Engineer, Data Scientist"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    Preferred Location
                  </label>
                  <input
                    className="px-4 py-3 border-2 border-gray-300 rounded-xl text-sm transition-all focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 hover:border-gray-400"
                    value={preferences.location}
                    onChange={(e) => setPreferences(p => ({ ...p, location: e.target.value }))}
                    placeholder="e.g., New York, San Francisco, Remote"
                  />
                </div>
              </div>
              <label className="flex items-center gap-3 text-sm cursor-pointer p-4 bg-white hover:bg-indigo-50 rounded-xl transition-all border-2 border-transparent hover:border-indigo-200 group">
                <input 
                  type="checkbox" 
                  checked={preferences.remote} 
                  onChange={(e) => setPreferences(p => ({ ...p, remote: e.target.checked }))}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <Globe className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-gray-700 flex-1">Only show remote positions</span>
                {preferences.remote && (
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold">
                    Active
                  </span>
                )}
              </label>
            </div>
          )}
        </div>

        {/* Skills Summary */}
        {skills && skills.length > 0 && (
          <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-indigo-100">
            <h5 className="flex items-center gap-2 text-sm font-bold text-indigo-900 mb-4">
              <Building2 className="w-5 h-5" />
              Your Professional Profile
            </h5>
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 10).map((skill, i) => (
                <span 
                  key={i} 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs px-4 py-2 rounded-full font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 10 && (
                <span className="bg-gray-500 text-white text-xs px-4 py-2 rounded-full font-semibold shadow-md">
                  +{skills.length - 10} more skills
                </span>
              )}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
          <div className="p-6 space-y-4 min-h-full">
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
                <div className={`group relative rounded-2xl p-5 shadow-lg max-w-[80%] transition-all hover:shadow-xl ${
                  c.from === 'user' 
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-md' 
                    : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
                }`}>
                  <div className={`flex items-center gap-2 text-xs font-bold mb-2 ${
                    c.from === 'user' ? 'text-indigo-100' : 'text-gray-500'
                  }`}>
                    {c.from === 'user' ? (
                      <>
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                          👤
                        </div>
                        You
                      </>
                    ) : (
                      <>
                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-indigo-600" />
                        </div>
                        AI Assistant
                        <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs">Online</span>
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
                <div className="bg-white rounded-2xl rounded-bl-md p-5 shadow-lg border border-gray-200 max-w-[80%]">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Loader className="w-5 h-5 animate-spin text-indigo-600" />
                    <span className="text-sm font-medium">AI is analyzing and searching...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>

      {/* Input Section - Footer */}
      <div className="p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-t-2 border-indigo-200 flex-shrink-0">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-sm font-semibold flex items-center gap-2 shadow-md">
            <X className="w-5 h-5" />
            {error}
          </div>
        )}
        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            className="flex-1 px-5 py-4 border-2 border-gray-300 rounded-2xl text-base transition-all focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-gray-100 resize-none hover:border-gray-400 shadow-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask me to find specific job opportunities, filter by location, salary, or requirements..."
            disabled={loading}
            onKeyDown={handleKeyPress}
            rows={2}
          />
          <button 
            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all shadow-lg min-w-[120px] ${
              loading || !message.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl transform hover:scale-105'
            }`}
            onClick={sendMessage} 
            disabled={loading || !message.trim()}
          >
            {loading ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                <span className="hidden sm:inline">Thinking...</span>
              </>
            ) : (
              <>
                <Send className="w-6 h-6" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3" />
          Press Enter to send • Shift+Enter for new line
        </p>
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
      {isFullscreen ? (
        createPortal(
          <>
            {/* Fullscreen backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] transition-opacity duration-300"
              onClick={() => setIsFullscreen(false)}
            />
            {chatContent}
          </>,
          document.body
        )
      ) : (
        chatContent
      )}
    </>
  );
}

export default JobChat;