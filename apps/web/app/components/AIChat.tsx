"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "Why am I so tired today?",
  "What should I eat this week?",
  "Why do I feel bloated?",
  "How can I manage my stress?",
];

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #C17B7B, #D4978A)",
          border: "none",
          cursor: "pointer",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(193, 123, 123, 0.4)",
          fontSize: "1.4rem",
        }}
      >
        {open ? "✕" : "✨"}
      </button>

      {/* Chat window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "24px",
            width: "340px",
            height: "480px",
            background: "#FAF7F5",
            borderRadius: "24px",
            border: "1px solid #EDE0D8",
            zIndex: 50,
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 8px 40px rgba(193, 123, 123, 0.15)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #C17B7B, #D4978A)",
              padding: "16px 20px",
              color: "white",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "1rem",
                fontWeight: 600,
                margin: 0,
              }}
            >
              CycleWell AI ✨
            </p>
            <p
              style={{ fontSize: "0.72rem", opacity: 0.85, margin: "2px 0 0" }}
            >
              Your personal PCOS companion
            </p>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {messages.length === 0 && (
              <div>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "#8C6B63",
                    marginBottom: "12px",
                    lineHeight: 1.5,
                  }}
                >
                  Hi! I'm your PCOS companion. Ask me anything about your cycle,
                  symptoms, or wellness 🌸
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      style={{
                        background: "#fff",
                        border: "1px solid #EDE0D8",
                        borderRadius: "12px",
                        padding: "8px 12px",
                        fontSize: "0.78rem",
                        color: "#8C6B63",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius:
                      msg.role === "user"
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                    background: msg.role === "user" ? "#C17B7B" : "#fff",
                    color: msg.role === "user" ? "white" : "#2C1810",
                    fontSize: "0.82rem",
                    lineHeight: 1.5,
                    border:
                      msg.role === "assistant" ? "1px solid #EDE0D8" : "none",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #EDE0D8",
                    borderRadius: "18px 18px 18px 4px",
                    padding: "10px 16px",
                    fontSize: "0.82rem",
                    color: "#B09A95",
                  }}
                >
                  Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid #EDE0D8",
              display: "flex",
              gap: "8px",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Ask anything..."
              style={{
                flex: 1,
                border: "1px solid #EDE0D8",
                borderRadius: "100px",
                padding: "8px 14px",
                fontSize: "0.82rem",
                color: "#2C1810",
                background: "#fff",
                outline: "none",
              }}
            />
            <button
              onClick={() => send(input)}
              style={{
                background: "#C17B7B",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.9rem",
                color: "white",
                flexShrink: 0,
              }}
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
