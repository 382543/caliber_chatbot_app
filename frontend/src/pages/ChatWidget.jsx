import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Mic, MicOff } from "lucide-react";

const API_BASE = 
  import.meta.env?.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm Caliber. Ask me about symptoms, daily care, or wellness tips. 😊" },
  ]);
  const endRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      // Remove specific language to enable auto-detection of any language
      // This allows users to speak in English, Hindi, Spanish, Chinese, Arabic, etc.
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setListening(false);
      };

      recognitionRef.current.onerror = () => {
        setListening(false);
      };

      recognitionRef.current.onend = () => {
        setListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in your browser. Please use Chrome or Edge.");
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json();
      const reply = data?.reply || "Sorry, I couldn’t reply.";
      setMessages((m) => [...m, { role: "bot", text: reply }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "error", text: "Network error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          className="chat-fab"
          onClick={() => setOpen(true)}
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-title">Caliber Assistant</div>
            <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={18} />
            </button>
          </div>

          <div className="chat-body">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`msg ${m.role === "user" ? "user" : m.role === "bot" ? "bot" : "error"}`}
              >
                {m.text}
              </div>
            ))}
            {loading && <div className="typing">Caliber is typing…</div>}
            <div ref={endRef} />
          </div>

          <div className="chat-input-row">
            <textarea
              className="chat-input"
              placeholder={listening ? "Listening..." : "Type your question..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              disabled={listening}
            />
            <button 
              className={`mic-btn ${listening ? 'listening' : ''}`} 
              onClick={toggleListening}
              disabled={loading}
              title={listening ? "Stop listening" : "Start voice input"}
            >
              {listening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <button className="send-btn" onClick={sendMessage} disabled={loading || listening}>
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
