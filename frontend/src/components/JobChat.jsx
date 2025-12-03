import axios from "axios";
import {
  Bot,
  Briefcase,
  Globe,
  Loader,
  MapPin,
  Send,
  Settings,
  Target,
  X
} from "lucide-react";
import { useEffect, useState } from "react";

function JobChat({ skills }) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preferences, setPreferences] = useState({ location: "", remote: false, title: "" });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialSuggestionMade, setInitialSuggestionMade] = useState(false);

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
    
    try {
      const res = await axios.post("/api/chat", {
        message: userMessage,
        skills,
        preferences
      });
      setChat([...chat, { from: "user", text: userMessage }, { from: "bot", text: res.data.reply }]);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Chat error");
      setChat([...chat, { from: "user", text: userMessage }]); // Show user message even if error occurs
    } finally {
      setLoading(false);
    }
  };

  if (!isChatOpen) {
    return (
      <div className="card">
        <button
          onClick={() => setIsChatOpen(true)}
          disabled={!skills || skills.length === 0}
          className={`flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-medium transition-colors w-full text-lg ${
            skills && skills.length > 0 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Bot className="w-6 h-6" />
          {skills && skills.length > 0 ? 'Find Jobs for Me' : 'Upload Resume First'}
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Chat Header */}
      <div style={{ 
        padding: '1.5rem', 
        borderBottom: '1px solid #e2e8f0', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
        borderRadius: '16px 16px 0 0',
        margin: '-1.5rem -1.5rem 0 -1.5rem'
      }}>
          <h3 style={{ 
            margin: 0, 
            color: '#2d3748',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1.3rem',
            fontWeight: '600'
          }}>
            <Bot className="w-6 h-6" />
            Job Hunter AI
            <span style={{ 
              background: '#667eea', 
              color: 'white', 
              fontSize: '0.7rem', 
              padding: '0.2rem 0.5rem', 
              borderRadius: '10px',
              fontWeight: '500'
            }}>
              BETA
            </span>
          </h3>
          <button 
            onClick={() => setIsChatOpen(false)} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              fontSize: '1.2rem', 
              cursor: 'pointer',
              color: '#718096',
              padding: '0.5rem',
              borderRadius: '6px',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = '#edf2f7'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '1.5rem', flexGrow: 1, overflowY: 'auto' }}>
          {/* Preferences */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ 
              margin: '0 0 1rem 0', 
              color: '#4a5568', 
              fontSize: '1rem', 
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Settings className="w-4 h-4" />
              Job Preferences
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '500', color: '#4a5568', marginBottom: '0.25rem' }}>
                <Target className="w-3 h-3 inline mr-1" />
                Target Role
              </label>
                <input
                  className="form-control"
                  style={{ fontSize: '0.9rem', padding: '0.6rem' }}
                  value={preferences.title}
                  onChange={(e) => setPreferences(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g., Software Engineer"
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: '500', color: '#4a5568', marginBottom: '0.25rem' }}>
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Location
                </label>
                <input
                  className="form-control"
                  style={{ fontSize: '0.9rem', padding: '0.6rem' }}
                  value={preferences.location}
                  onChange={(e) => setPreferences(p => ({ ...p, location: e.target.value }))}
                  placeholder="e.g., New York, NY"
                />
              </div>
            </div>
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: '0.5rem', 
              fontSize: '0.9rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '6px',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = '#f7fafc'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <input 
                type="checkbox" 
                checked={preferences.remote} 
                onChange={(e) => setPreferences(p => ({ ...p, remote: e.target.checked }))}
                style={{ transform: 'scale(1.1)' }}
              />
              <Globe className="w-4 h-4" />
              Remote positions only
            </label>
          </div>

          {/* Skills Summary */}
          {skills && skills.length > 0 && (
            <div style={{ 
              background: '#eef2ff', 
              border: '1px solid #c3dafe',
              borderRadius: '8px', 
              padding: '1rem', 
              marginBottom: '1.5rem' 
            }}>
              <h5 style={{ margin: '0 0 0.5rem 0', color: '#3c366b', fontSize: '0.9rem', fontWeight: '600' }}>
                <Target className="w-4 h-4 inline mr-1" />
                Your Skills ({skills.length})
              </h5>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                {skills.slice(0, 8).map((skill, i) => (
                  <span key={i} style={{
                    background: '#667eea',
                    color: 'white',
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '12px',
                    fontWeight: '500'
                  }}>
                    {skill}
                  </span>
                ))}
                {skills.length > 8 && (
                  <span style={{
                    background: '#a0aec0',
                    color: 'white',
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '12px',
                    fontWeight: '500'
                  }}>
                    +{skills.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div style={{ 
            border: "1px solid #e2e8f0", 
            padding: '1rem', 
            height: '280px', 
            overflowY: "auto", 
            borderRadius: '8px', 
            background: "#fafbfc",
            marginBottom: '1rem'
          }}>
            {chat.length === 0 && !loading && (
              <div style={{ textAlign: 'center', color: "#718096", padding: '2rem 1rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  <Briefcase style={{ width: '3rem', height: '3rem', margin: '0 auto', color: '#cbd5e0' }} />
                </div>
                <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>Analyzing your resume...</p>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>
                  I'm searching for job opportunities that match your skills!
                </p>
              </div>
            )}
            {chat.map((c, i) => (
              <div key={i} style={{ marginBottom: '1rem' }}>
                <div style={{ 
                  background: c.from === 'user' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                  color: 'white',
                  padding: '0.75rem 1rem',
                  borderRadius: c.from === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  marginBottom: '0.5rem',
                  maxWidth: '85%',
                  marginLeft: c.from === 'user' ? 'auto' : '0',
                  marginRight: c.from === 'user' ? '0' : 'auto'
                }}>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    opacity: 0.8, 
                    marginBottom: '0.25rem',
                    fontWeight: '500'
                  }}>
                    {c.from === 'user' ? 'You' : 'AI Assistant'}
                  </div>
                  <div style={{ fontSize: '0.9rem', lineHeight: '1.4', whiteSpace: "pre-wrap" }}>
                    {c.text}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: '#718096',
                fontSize: '0.9rem'
              }}>
                <Loader className="w-4 h-4 animate-spin" />
                AI is searching for jobs...
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer - Input */}
        <div style={{ 
          padding: '1.5rem', 
          borderTop: '1px solid #e2e8f0', 
          background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)'
        }}>
          {error && (
            <div className="error" style={{ fontSize: '0.85rem', padding: '0.5rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          <div style={{ display: "flex", gap: '0.5rem' }}>
            <input
              className="form-control"
              style={{ 
                flex: 1,
                fontSize: '0.9rem'
              }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me to find job opportunities..."
              disabled={loading}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button 
              className="btn btn-primary"
              onClick={sendMessage} 
              disabled={loading || !message.trim()} 
              style={{ 
                fontSize: '0.9rem',
                minWidth: '80px'
              }}
            >
              {loading ? (
                <div className="loading">
                  <Loader className="w-4 h-4 animate-spin" />
                  ...
                </div>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

export default JobChat;