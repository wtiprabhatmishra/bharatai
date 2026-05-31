import React, { useState, useRef, useEffect } from "react";

const MODES = [
  { id: "chat", label: "💬 AI Chat", icon: "💬", desc: "Ask anything, get instant answers" },
  { id: "image", label: "🎨 Image Gen", icon: "🎨", desc: "Generate stunning images from text" },
  { id: "research", label: "🔬 Research", icon: "🔬", desc: "Deep research with citations" },
  { id: "casestudy", label: "📊 Case Study", icon: "📊", desc: "Full professional case studies" },
  { id: "write", label: "✍️ Writer", icon: "✍️", desc: "Articles, blogs, essays & more" },
  { id: "code", label: "💻 Code", icon: "💻", desc: "Generate & debug any code" },
];

const SYSTEM_PROMPTS = {
  chat: "You are a brilliant, friendly AI assistant. Answer clearly, helpfully, and thoroughly. Use formatting like bullet points and headers where helpful.",
  image: `You are an expert AI image prompt engineer and visual artist. When the user describes an image they want, generate a HIGHLY DETAILED, professional image generation prompt (as if for Midjourney/DALL-E), then also describe what the image would look like in vivid detail as if painting a picture with words. Structure your response as:

**🎨 Generated Image Prompt:**
[Detailed prompt here]

**🖼️ Visual Description:**
[Vivid description of the resulting image]

**💡 Style Variations:**
[3 alternative style suggestions]`,
  research: `You are a world-class research analyst. When given a topic, provide a comprehensive research report with:
- Executive Summary
- Background & Context
- Key Findings (with data points)
- Analysis & Insights
- Expert Perspectives
- Current Trends
- Future Outlook
- References & Sources (cite real, credible sources)
Format with clear headings, bullet points, and data tables where relevant.`,
  casestudy: `You are a top-tier business consultant and case study writer. Create a complete, professional case study with:
- Executive Summary
- Company/Situation Background
- Problem Statement
- Challenges Faced
- Solutions Implemented
- Results & Outcomes (with metrics)
- Key Learnings
- Recommendations
Make it detailed, data-driven, and publication-ready.`,
  write: `You are a master writer and content strategist. Create high-quality, engaging written content. Structure it well with clear headings, compelling introductions, and strong conclusions. Adapt tone and style to the request.`,
  code: `You are an expert software engineer. Write clean, efficient, well-commented code. Always explain your approach, highlight key concepts, and provide usage examples. Support any programming language requested.`,
};

const SUGGESTIONS = {
  chat: ["What is quantum computing?", "Explain blockchain simply", "Best productivity tips for 2025", "How does AI work?"],
  image: ["A futuristic Indian city at sunset", "A warrior goddess in cyberpunk style", "A serene Himalayan monastery at dawn", "Abstract digital art with Vedic geometry"],
  research: ["AI's impact on Indian economy", "Climate change solutions 2025", "Future of electric vehicles in India", "Mental health crisis post-pandemic"],
  casestudy: ["Zomato's growth strategy in India", "Tesla's entry into emerging markets", "Jio's disruption of Indian telecom", "ISRO's cost-efficient space missions"],
  write: ["Write a blog on AI in healthcare", "An essay on modern India's rise", "Article: Future of work in 2030", "Opinion piece on digital privacy"],
  code: ["Build a todo app in React", "Python web scraper for news", "REST API with Node.js", "Machine learning model for prediction"],
};

export default function BharatAI() {
  const [mode, setMode] = useState("chat");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    setMessages([]);
    setInput("");
  }, [mode]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          systemPrompt: SYSTEM_PROMPTS[mode]
        }),
      });
      const data = await res.json();
      const reply = data.reply || "Something went wrong.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Error connecting to AI. Please try again." }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:#1e293b;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.9em;color:#7dd3fc">$1</code>')
      .replace(/^### (.*$)/gm, '<h3 style="color:#f59e0b;font-size:1.1em;margin:12px 0 6px;font-weight:700">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 style="color:#f59e0b;font-size:1.2em;margin:16px 0 8px;font-weight:700">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 style="color:#f59e0b;font-size:1.4em;margin:16px 0 8px;font-weight:800">$1</h1>')
      .replace(/^- (.*$)/gm, '<div style="display:flex;gap:8px;margin:4px 0"><span style="color:#f59e0b;flex-shrink:0">▸</span><span>$1</span></div>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  };

  const currentMode = MODES.find(m => m.id === mode);

  return (
    <div style={{
      display: "flex", height: "100vh", background: "#020617",
      fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#e2e8f0",
      overflow: "auto"
    }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? "260px" : "0px",
        transition: "width 0.3s ease",
        overflow: "hidden",
        background: "#0f172a",
        borderRight: "1px solid #1e293b",
        display: "flex", flexDirection: "column",
        flexShrink: 0
      }}>
        <div style={{ padding: "24px 20px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{
              width: 36, height: 36, borderRadius: "10px",
              background: "linear-gradient(135deg, #f59e0b, #ef4444)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px"
            }}>⚡</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "16px", color: "#f8fafc" }}>BharatAI</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Free • No Login • Unlimited</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "8px 12px", flex: 1 }}>
          <div style={{ fontSize: "11px", color: "#475569", fontWeight: 700, marginBottom: "8px", paddingLeft: "8px", letterSpacing: "0.05em" }}>TOOLS</div>
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} style={{
              display: "flex", alignItems: "center", gap: "12px",
              width: "100%", padding: "10px 12px", borderRadius: "10px",
              background: mode === m.id ? "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.1))" : "transparent",
              border: mode === m.id ? "1px solid rgba(245,158,11,0.3)" : "1px solid transparent",
              color: mode === m.id ? "#f59e0b" : "#94a3b8",
              cursor: "pointer", textAlign: "left", marginBottom: "4px",
              transition: "all 0.2s"
            }}>
              <span style={{ fontSize: "18px" }}>{m.icon}</span>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>{m.label.split(" ").slice(1).join(" ")}</div>
                <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "2px" }}>{m.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ padding: "16px", borderTop: "1px solid #1e293b" }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(239,68,68,0.1))",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: "10px", padding: "12px", textAlign: "center"
          }}>
            <div style={{ fontSize: "20px", marginBottom: "4px" }}>🇮🇳</div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#f59e0b" }}>Made for Bharat</div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>Powered by BharatPath</div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          padding: "16px 20px", background: "#0f172a",
          borderBottom: "1px solid #1e293b",
          display: "flex", alignItems: "center", gap: "16px"
        }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            background: "transparent", border: "none", color: "#64748b",
            cursor: "pointer", fontSize: "20px", padding: "4px"
          }}>☰</button>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "22px" }}>{currentMode.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "15px" }}>{currentMode.label.split(" ").slice(1).join(" ")}</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>{currentMode.desc}</div>
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{
              background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
              borderRadius: "20px", padding: "4px 10px", fontSize: "12px", color: "#4ade80"
            }}>● Live</div>
            <div style={{
              background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: "20px", padding: "4px 10px", fontSize: "12px", color: "#f59e0b"
            }}>Free Forever</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
          {messages.length === 0 && (
            <div style={{ maxWidth: "700px", margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <div style={{
                  fontSize: "56px", marginBottom: "16px",
                  filter: "drop-shadow(0 0 20px rgba(245,158,11,0.5))"
                }}>{currentMode.icon}</div>
                <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#f8fafc", marginBottom: "8px" }}>
                  {currentMode.label.split(" ").slice(1).join(" ")}
                </h1>
                <p style={{ color: "#64748b", fontSize: "15px" }}>{currentMode.desc}</p>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "12px", color: "#475569", fontWeight: 700, marginBottom: "12px", letterSpacing: "0.05em" }}>TRY THESE →</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {SUGGESTIONS[mode].map((s, i) => (
                    <button key={i} onClick={() => setInput(s)} style={{
                      background: "#0f172a", border: "1px solid #1e293b",
                      borderRadius: "10px", padding: "14px 16px",
                      color: "#cbd5e1", cursor: "pointer", textAlign: "left",
                      fontSize: "13px", transition: "all 0.2s", lineHeight: 1.4
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.4)"; e.currentTarget.style.color = "#f8fafc"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.color = "#cbd5e1"; }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                marginBottom: "20px",
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
              }}>
                {msg.role === "assistant" && (
                  <div style={{
                    width: 32, height: 32, borderRadius: "8px",
                    background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "14px", flexShrink: 0, marginRight: "12px", marginTop: "2px"
                  }}>⚡</div>
                )}
                <div style={{
                  maxWidth: "80%",
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, #f59e0b, #ef4444)"
                    : "#0f172a",
                  border: msg.role === "user" ? "none" : "1px solid #1e293b",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                  padding: "14px 18px",
                  color: msg.role === "user" ? "#000" : "#e2e8f0",
                  fontSize: "14px", lineHeight: 1.7,
                  fontWeight: msg.role === "user" ? 600 : 400
                }}
                  dangerouslySetInnerHTML={{ __html: msg.role === "assistant" ? formatText(msg.content) : msg.content }}
                />
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "8px",
                  background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px"
                }}>⚡</div>
                <div style={{
                  background: "#0f172a", border: "1px solid #1e293b",
                  borderRadius: "4px 18px 18px 18px", padding: "14px 18px",
                  display: "flex", gap: "6px", alignItems: "center"
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: "#f59e0b",
                      animation: "pulse 1.4s ease-in-out infinite",
                      animationDelay: `${i * 0.2}s`
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div style={{ padding: "16px 20px", background: "#0f172a", borderTop: "1px solid #1e293b" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            <div style={{
              display: "flex", gap: "12px", alignItems: "flex-end",
              background: "#020617", border: "1px solid #1e293b",
              borderRadius: "16px", padding: "12px 16px",
              transition: "border-color 0.2s"
            }}
              onFocus={e => e.currentTarget.style.borderColor = "rgba(245,158,11,0.4)"}
              onBlur={e => e.currentTarget.style.borderColor = "#1e293b"}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={`${currentMode.icon} ${mode === "chat" ? "Ask me anything..." : mode === "image" ? "Describe the image you want..." : mode === "research" ? "What topic to research?" : mode === "casestudy" ? "Company or situation for case study..." : mode === "write" ? "What do you want me to write?" : "What code do you need?"}`}
                rows={1}
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  color: "#e2e8f0", fontSize: "14px", resize: "none", lineHeight: 1.6,
                  fontFamily: "inherit", maxHeight: "120px", overflowY: "auto"
                }}
                onInput={e => {
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
              />
              {messages.length > 0 && (
                <button onClick={() => setMessages([])} style={{
                  background: "transparent", border: "none", color: "#475569",
                  cursor: "pointer", fontSize: "18px", padding: "4px", flexShrink: 0
                }} title="Clear chat">🗑️</button>
              )}
              <button onClick={sendMessage} disabled={!input.trim() || loading} style={{
                background: input.trim() && !loading
                  ? "linear-gradient(135deg, #f59e0b, #ef4444)"
                  : "#1e293b",
                border: "none", borderRadius: "10px",
                width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                flexShrink: 0, transition: "all 0.2s",
                fontSize: "16px"
              }}>➤</button>
            </div>
            <div style={{ textAlign: "center", marginTop: "8px", fontSize: "11px", color: "#334155" }}>
              No login • No subscription • 100% Free • Powered by BharatPath
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
        textarea::placeholder { color: #334155; }
      `}</style>
    </div>
  );
}
