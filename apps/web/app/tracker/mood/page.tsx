"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const moodOptions = [
  { label: "Happy", emoji: "😊", color: "#F5C842" },
  { label: "Calm", emoji: "😌", color: "#8EC4B0" },
  { label: "Sad", emoji: "😢", color: "#85B7EB" },
  { label: "Anxious", emoji: "😰", color: "#D4978A" },
  { label: "Irritable", emoji: "😤", color: "#E8837A" },
  { label: "Energetic", emoji: "⚡", color: "#F5A642" },
];

const journalPrompts = [
  "What made you smile today, even if just for a moment?",
  "What's been weighing on your mind lately?",
  "How is your body feeling today — physically and emotionally?",
  "What are you most grateful for right now?",
  "What do you need more of in your life right now?",
  "If your body could talk, what would it say to you today?",
  "What's one small thing you could do today to feel better?",
];

interface MoodLog {
  id: string;
  date: string;
  mood: string;
  stressLevel: number;
  journalText?: string;
  aiInsight?: string;
}

export default function MoodTrackerPage() {
  const [mood, setMood] = useState("");
  const [stressLevel, setStressLevel] = useState(5);
  const [journal, setJournal] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [aiInsight, setAiInsight] = useState("");
  const [history, setHistory] = useState<MoodLog[]>([]);
  const todayPrompt =
    journalPrompts[new Date().getDay() % journalPrompts.length];

  useEffect(() => {
    fetch("/api/mood")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setHistory(data.data);
      });
  }, []);

  const handleSave = async () => {
    if (!mood) return;
    setSaving(true);
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
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        fetch("/api/mood")
          .then((r) => r.json())
          .then((data) => {
            if (data.success) setHistory(data.data);
          });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getInsight = async () => {
    if (!journal.trim()) return;
    setLoadingInsight(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `I'm feeling ${mood} today with a stress level of ${stressLevel}/10. Here's my journal entry: "${journal}". Give me a warm, personal 2-3 sentence insight about how I'm feeling and one gentle suggestion.`,
        }),
      });
      const data = await res.json();
      if (data.reply) setAiInsight(data.reply);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsight(false);
    }
  };

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toDateString();
    const log = history.find(
      (h) => new Date(h.date).toDateString() === dateStr,
    );
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      isToday: i === 6,
      mood: log?.mood || null,
      stress: log?.stressLevel || null,
    };
  });

  const moodColors: Record<string, string> = {
    Happy: "#F5C842",
    Calm: "#8EC4B0",
    Sad: "#85B7EB",
    Anxious: "#D4978A",
    Irritable: "#E8837A",
    Energetic: "#F5A642",
  };

  const moodEmojis: Record<string, string> = {
    Happy: "😊",
    Calm: "😌",
    Sad: "😢",
    Anxious: "😰",
    Irritable: "😤",
    Energetic: "⚡",
  };

  const stressColor =
    stressLevel <= 3 ? "#8EC4B0" : stressLevel <= 6 ? "#F5C842" : "#E8837A";

  return (
    <main style={{ backgroundColor: "#FAF7F5", minHeight: "100vh" }}>
      <nav
        style={{
          backgroundColor: "#fff",
          borderBottom: "1px solid #EDE0D8",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
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

      <div
        style={{
          maxWidth: "560px",
          margin: "0 auto",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: "#F5EAE8",
                border: "1px solid #C17B7B",
                borderRadius: "14px",
                padding: "12px 16px",
                color: "#A05C5C",
                fontSize: "0.85rem",
                fontWeight: 500,
              }}
            >
              ✓ Mood logged successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mood selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: "#fff",
            border: "1px solid #EDE0D8",
            borderRadius: "20px",
            padding: "20px",
          }}
        >
          <p
            style={{
              fontSize: "0.68rem",
              fontWeight: 600,
              color: "#B09A95",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "14px",
            }}
          >
            How are you feeling?
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
            }}
          >
            {moodOptions.map((m, i) => (
              <motion.button
                key={m.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMood(m.label)}
                style={{
                  padding: "16px 8px",
                  borderRadius: "16px",
                  border: "1px solid",
                  borderColor: mood === m.label ? m.color : "#EDE0D8",
                  background: mood === m.label ? `${m.color}20` : "#FAF7F5",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s",
                }}
              >
                <motion.span
                  animate={{ scale: mood === m.label ? 1.2 : 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  style={{ fontSize: "1.8rem" }}
                >
                  {m.emoji}
                </motion.span>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: mood === m.label ? "#2C1810" : "#8C6B63",
                    fontWeight: mood === m.label ? 600 : 400,
                  }}
                >
                  {m.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Stress slider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          style={{
            background: "#fff",
            border: "1px solid #EDE0D8",
            borderRadius: "20px",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "14px",
            }}
          >
            <p
              style={{
                fontSize: "0.68rem",
                fontWeight: 600,
                color: "#B09A95",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Stress Level
            </p>
            <motion.span
              key={stressLevel}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "1.6rem",
                fontWeight: 700,
                color: stressColor,
              }}
            >
              {stressLevel}
            </motion.span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={stressLevel}
            onChange={(e) => setStressLevel(Number(e.target.value))}
            style={{
              width: "100%",
              accentColor: stressColor,
              cursor: "pointer",
              marginBottom: "8px",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span
              style={{ fontSize: "0.65rem", color: "#8EC4B0", fontWeight: 500 }}
            >
              Very calm
            </span>
            <span
              style={{ fontSize: "0.65rem", color: "#E8837A", fontWeight: 500 }}
            >
              Very stressed
            </span>
          </div>
        </motion.div>

        {/* Journal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          style={{
            background: "#fff",
            border: "1px solid #EDE0D8",
            borderRadius: "20px",
            padding: "20px",
          }}
        >
          <p
            style={{
              fontSize: "0.68rem",
              fontWeight: 600,
              color: "#B09A95",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "12px",
            }}
          >
            Journal
          </p>
          <div
            style={{
              background: "linear-gradient(135deg, #F5EAE8, #FAF7F5)",
              border: "1px solid #EDE0D8",
              borderRadius: "14px",
              padding: "14px 16px",
              marginBottom: "12px",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "0.88rem",
                color: "#C17B7B",
                fontStyle: "italic",
                lineHeight: 1.6,
              }}
            >
              "{todayPrompt}"
            </p>
          </div>
          <textarea
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            placeholder="Write your thoughts here..."
            style={{
              width: "100%",
              border: "1px solid #EDE0D8",
              borderRadius: "12px",
              padding: "12px 14px",
              fontSize: "0.88rem",
              color: "#2C1810",
              background: "#FAF7F5",
              outline: "none",
              resize: "none",
              height: "100px",
              lineHeight: 1.6,
            }}
          />

          <AnimatePresence>
            {aiInsight && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  background: "linear-gradient(135deg, #F5EAE8, #FAF7F5)",
                  border: "1px solid #EDE0D8",
                  borderRadius: "14px",
                  padding: "14px 16px",
                  marginTop: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "8px",
                  }}
                >
                  <span>✨</span>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      color: "#B09A95",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    AI insight
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "0.65rem",
                      background: "#fff",
                      color: "#C17B7B",
                      padding: "2px 8px",
                      borderRadius: "100px",
                      border: "1px solid #EDE0D8",
                      fontWeight: 500,
                    }}
                  >
                    Claude
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "0.85rem",
                    color: "#2C1810",
                    fontStyle: "italic",
                    lineHeight: 1.7,
                  }}
                >
                  "{aiInsight}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={getInsight}
            disabled={loadingInsight || !journal.trim()}
            style={{
              width: "100%",
              background:
                loadingInsight || !journal.trim() ? "#EDE0D8" : "#C17B7B",
              color: loadingInsight || !journal.trim() ? "#B09A95" : "#fff",
              border: "none",
              borderRadius: "100px",
              padding: "12px",
              fontSize: "0.88rem",
              fontWeight: 600,
              cursor:
                loadingInsight || !journal.trim() ? "not-allowed" : "pointer",
              marginTop: "12px",
            }}
          >
            {loadingInsight ? "Getting insight..." : "✨ Get AI insight"}
          </motion.button>
        </motion.div>

        {/* Weekly mood chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{
            background: "#fff",
            border: "1px solid #EDE0D8",
            borderRadius: "20px",
            padding: "20px",
          }}
        >
          <p
            style={{
              fontSize: "0.68rem",
              fontWeight: 600,
              color: "#B09A95",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "16px",
            }}
          >
            This week's mood
          </p>
          <div
            style={{
              display: "flex",
              gap: "6px",
              alignItems: "flex-end",
              height: "90px",
            }}
          >
            {last7.map((day, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  height: "100%",
                }}
              >
                <span style={{ fontSize: "1rem" }}>
                  {day.mood ? moodEmojis[day.mood] : "·"}
                </span>
                <div
                  style={{
                    flex: 1,
                    width: "100%",
                    display: "flex",
                    alignItems: "flex-end",
                  }}
                >
                  {day.stress ? (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.stress / 10) * 100}%` }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      style={{
                        width: "100%",
                        borderRadius: "6px 6px 0 0",
                        background: day.mood ? moodColors[day.mood] : "#EDE0D8",
                        minHeight: "4px",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "4px",
                        borderRadius: "4px",
                        background: "#EDE0D8",
                      }}
                    />
                  )}
                </div>
                <span
                  style={{
                    fontSize: "0.58rem",
                    color: day.isToday ? "#C17B7B" : "#B09A95",
                    fontWeight: day.isToday ? 600 : 400,
                  }}
                >
                  {day.isToday ? "Today" : day.day}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Save button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving || !mood}
          style={{
            width: "100%",
            background: saving || !mood ? "#EDE0D8" : "#C17B7B",
            color: saving || !mood ? "#B09A95" : "#fff",
            border: "none",
            borderRadius: "100px",
            padding: "16px",
            fontSize: "0.95rem",
            fontWeight: 600,
            cursor: saving || !mood ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving..." : "Log Mood 🌸"}
        </motion.button>

        {/* History */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              background: "#fff",
              border: "1px solid #EDE0D8",
              borderRadius: "20px",
              padding: "20px",
            }}
          >
            <p
              style={{
                fontSize: "0.68rem",
                fontWeight: 600,
                color: "#B09A95",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "4px",
              }}
            >
              Recent Entries
            </p>
            {history.slice(0, 5).map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom:
                    i < Math.min(history.length, 5) - 1
                      ? "1px solid #EDE0D8"
                      : "none",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span style={{ fontSize: "1.4rem" }}>
                    {moodEmojis[log.mood] || "🌸"}
                  </span>
                  <div>
                    <p
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 600,
                        color: "#2C1810",
                      }}
                    >
                      {log.mood}
                    </p>
                    <p
                      style={{
                        fontSize: "0.72rem",
                        color: "#B09A95",
                        marginTop: "1px",
                      }}
                    >
                      {new Date(log.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    background: "#F5EAE8",
                    color: "#C17B7B",
                    padding: "3px 10px",
                    borderRadius: "100px",
                    fontWeight: 600,
                  }}
                >
                  Stress {log.stressLevel}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
