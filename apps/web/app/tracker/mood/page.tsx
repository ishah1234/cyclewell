"use client";

import { useState } from "react";
import Link from "next/link";

const moodOptions = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😰", label: "Anxious" },
  { emoji: "😤", label: "Irritable" },
  { emoji: "⚡", label: "Energetic" },
];

const journalPrompts = [
  "What made you smile today?",
  "What's been weighing on your mind lately?",
  "How is your body feeling today?",
  "What are you grateful for today?",
  "What do you need more of right now?",
];

const card = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #EDE0D8",
  borderRadius: "20px",
  padding: "24px",
};

const labelStyle = {
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#B09A95",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  display: "block",
  marginBottom: "12px",
};

export default function MoodTrackerPage() {
  const [mood, setMood] = useState("");
  const [stressLevel, setStressLevel] = useState(5);
  const [journal, setJournal] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const todayPrompt =
    journalPrompts[new Date().getDay() % journalPrompts.length];

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood,
          stressLevel,
          journalText: journal,
          date: new Date().toISOString(),
        }),
      });
      if (res.ok) setSaved(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#FAF7F5" }}>
      {/* Nav */}
      <nav
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #EDE0D8",
        }}
        className="px-8 py-5 flex items-center gap-4"
      >
        <Link
          href="/dashboard"
          style={{ color: "#B09A95", fontSize: "0.85rem" }}
        >
          ← Back
        </Link>
        <h1
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "1.2rem",
            color: "#2C1810",
            fontWeight: 600,
          }}
        >
          Mood & Stress
        </h1>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-10 flex flex-col gap-6">
        {saved && (
          <div
            style={{
              backgroundColor: "#F5EAE8",
              border: "1px solid #C17B7B",
              borderRadius: "16px",
              padding: "16px 20px",
              color: "#A05C5C",
              fontSize: "0.9rem",
              fontWeight: 500,
            }}
          >
            ✓ Mood logged successfully
          </div>
        )}

        {/* Mood selector */}
        <div style={card}>
          <p style={labelStyle}>How are you feeling?</p>
          <div className="grid grid-cols-3 gap-3">
            {moodOptions.map((m) => (
              <button
                key={m.label}
                onClick={() => setMood(m.label)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  padding: "16px 8px",
                  borderRadius: "16px",
                  border:
                    mood === m.label
                      ? "1px solid #C17B7B"
                      : "1px solid #EDE0D8",
                  backgroundColor: mood === m.label ? "#F5EAE8" : "#FFFFFF",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: "1.8rem" }}>{m.emoji}</span>
                <span
                  style={{
                    fontSize: "0.78rem",
                    color: mood === m.label ? "#A05C5C" : "#8C6B63",
                    fontWeight: mood === m.label ? 600 : 400,
                  }}
                >
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Stress level */}
        <div style={card}>
          <p style={labelStyle}>Stress Level</p>
          <div className="flex justify-between items-center mb-3">
            <span style={{ fontSize: "0.82rem", color: "#B09A95" }}>Calm</span>
            <span
              style={{
                fontSize: "1.4rem",
                fontWeight: 700,
                color: "#C17B7B",
                fontFamily: "var(--font-playfair)",
              }}
            >
              {stressLevel}
            </span>
            <span style={{ fontSize: "0.82rem", color: "#B09A95" }}>
              Stressed
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={stressLevel}
            onChange={(e) => setStressLevel(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#C17B7B" }}
          />
        </div>

        {/* Journal */}
        <div style={card}>
          <p style={labelStyle}>Journal</p>
          <p
            style={{
              fontSize: "0.9rem",
              color: "#C17B7B",
              fontStyle: "italic",
              marginBottom: "16px",
              lineHeight: 1.6,
              fontFamily: "var(--font-playfair)",
            }}
          >
            "{todayPrompt}"
          </p>
          <textarea
            style={{
              width: "100%",
              border: "1px solid #EDE0D8",
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "0.9rem",
              color: "#2C1810",
              backgroundColor: "#FFFFFF",
              outline: "none",
              resize: "none",
              height: "120px",
            }}
            placeholder="Write your thoughts here..."
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={loading || !mood}
          style={{
            width: "100%",
            backgroundColor: loading || !mood ? "#EDE0D8" : "#C17B7B",
            color: loading || !mood ? "#B09A95" : "#FFFFFF",
            padding: "16px",
            borderRadius: "100px",
            fontSize: "0.95rem",
            fontWeight: 600,
            border: "none",
            cursor: loading || !mood ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          {loading ? "Saving..." : "Log Mood"}
        </button>
      </div>
    </main>
  );
}
