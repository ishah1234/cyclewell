"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const exerciseTypes = [
  { label: "Yoga", emoji: "🧘" },
  { label: "Walking", emoji: "🚶" },
  { label: "Strength", emoji: "🏋️" },
  { label: "Cardio", emoji: "🏃" },
  { label: "Stretching", emoji: "🤸" },
  { label: "Swimming", emoji: "🏊" },
  { label: "Cycling", emoji: "🚴" },
  { label: "HIIT", emoji: "🥊" },
  { label: "Dancing", emoji: "💃" },
];

const intensityOptions = [
  { label: "Low", emoji: "🌱", desc: "Gentle movement" },
  { label: "Medium", emoji: "🔥", desc: "Moderate effort" },
  { label: "High", emoji: "⚡", desc: "Intense workout" },
];

const phaseTips: Record<
  string,
  { title: string; desc: string; recommended: string[] }
> = {
  Menstrual: {
    title: "Rest & gentle movement",
    desc: "Your body needs rest. Light yoga or walking is ideal. Avoid high intensity.",
    recommended: ["Yoga", "Walking", "Stretching"],
  },
  Follicular: {
    title: "Great time for strength training",
    desc: "Rising estrogen boosts endurance. Try moderate to high intensity workouts.",
    recommended: ["Strength", "Cardio", "HIIT", "Cycling"],
  },
  Ovulatory: {
    title: "Peak performance phase",
    desc: "You're at peak strength and energy. Push yourself with high intensity.",
    recommended: ["HIIT", "Strength", "Cardio", "Dancing"],
  },
  Luteal: {
    title: "Wind down your workouts",
    desc: "Progesterone rises. Stick to moderate exercise and avoid overtraining.",
    recommended: ["Yoga", "Walking", "Swimming", "Stretching"],
  },
  Unknown: {
    title: "Move your body today",
    desc: "Any movement is good for PCOS. Start with what feels right.",
    recommended: ["Yoga", "Walking"],
  },
};

interface ExerciseLog {
  id: string;
  date: string;
  exerciseType: string;
  duration: number;
  intensity: string;
  notes?: string;
}

export default function ExerciseTrackerPage() {
  const [exerciseType, setExerciseType] = useState("");
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<ExerciseLog[]>([]);
  const [phase, setPhase] = useState("Unknown");
  const [cycleDay, setCycleDay] = useState(0);

  useEffect(() => {
    fetch("/api/exercise")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setHistory(data.data);
      });
    fetch("/api/cycle")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data[0]) {
          const lastPeriod = new Date(data.data[0].startDate);
          const days = Math.floor(
            (Date.now() - lastPeriod.getTime()) / 86400000,
          );
          const day = (days % 30) + 1;
          setCycleDay(day);
          if (day <= 5) setPhase("Menstrual");
          else if (day <= 13) setPhase("Follicular");
          else if (day <= 16) setPhase("Ovulatory");
          else setPhase("Luteal");
        }
      });
  }, []);

  const handleSave = async () => {
    if (!exerciseType || !intensity) return;
    setSaving(true);
    try {
      const res = await fetch("/api/exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseType,
          duration,
          intensity,
          notes,
          date: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        setExerciseType("");
        setDuration(30);
        setIntensity("");
        setNotes("");
        fetch("/api/exercise")
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

  // Weekly stats
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toDateString();
    const dayLogs = history.filter(
      (h) => new Date(h.date).toDateString() === dateStr,
    );
    const totalMins = dayLogs.reduce((sum, l) => sum + l.duration, 0);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      isToday: i === 6,
      mins: totalMins,
    };
  });

  const maxMins = Math.max(...last7.map((d) => d.mins), 60);
  const totalMinsWeek = last7.reduce((sum, d) => sum + d.mins, 0);
  const workoutsWeek = last7.filter((d) => d.mins > 0).length;

  const phaseGradients: Record<string, string> = {
    Menstrual: "linear-gradient(135deg, #8B4A4A, #C17B7B)",
    Follicular: "linear-gradient(135deg, #C17B7B, #D4978A)",
    Ovulatory: "linear-gradient(135deg, #D4978A, #E8B89A)",
    Luteal: "linear-gradient(135deg, #8C6B63, #C17B7B)",
    Unknown: "linear-gradient(135deg, #C17B7B, #D4978A)",
  };

  const phaseEmojis: Record<string, string> = {
    Menstrual: "🌑",
    Follicular: "🌒",
    Ovulatory: "🌕",
    Luteal: "🌖",
    Unknown: "🌙",
  };

  const tip = phaseTips[phase];

  const exerciseEmojis: Record<string, string> = Object.fromEntries(
    exerciseTypes.map((e) => [e.label, e.emoji]),
  );

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
          Exercise Tracker
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
              ✓ Workout logged!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: phaseGradients[phase],
            borderRadius: "20px",
            padding: "20px",
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-20px",
              right: "-20px",
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.07)",
            }}
          />
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              opacity: 0.85,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "6px",
            }}
          >
            {phaseEmojis[phase]} {phase} Phase{" "}
            {cycleDay > 0 ? `· Day ${cycleDay}` : ""}
          </p>
          <p
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "1rem",
              fontWeight: 600,
              marginBottom: "6px",
            }}
          >
            {tip.title}
          </p>
          <p
            style={{
              fontSize: "0.8rem",
              opacity: 0.85,
              lineHeight: 1.5,
              marginBottom: "12px",
            }}
          >
            {tip.desc}
          </p>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {tip.recommended.map((r) => (
              <span
                key={r}
                style={{
                  fontSize: "0.72rem",
                  background: "rgba(255,255,255,0.2)",
                  padding: "4px 10px",
                  borderRadius: "100px",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              >
                {exerciseEmojis[r]} {r}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Exercise type */}
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
              Type of Exercise
            </p>
            {exerciseType && (
              <span
                style={{
                  fontSize: "0.72rem",
                  background: "#F5EAE8",
                  color: "#C17B7B",
                  padding: "2px 10px",
                  borderRadius: "100px",
                  fontWeight: 600,
                }}
              >
                {exerciseType}
              </span>
            )}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
            }}
          >
            {exerciseTypes.map((e, i) => {
              const isRecommended = tip.recommended.includes(e.label);
              return (
                <motion.button
                  key={e.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setExerciseType(e.label)}
                  style={{
                    padding: "14px 6px",
                    borderRadius: "14px",
                    border: "1px solid",
                    borderColor:
                      exerciseType === e.label
                        ? "#C17B7B"
                        : isRecommended
                          ? "#D4978A"
                          : "#EDE0D8",
                    background:
                      exerciseType === e.label
                        ? "#F5EAE8"
                        : isRecommended
                          ? "#FDF5F0"
                          : "#FAF7F5",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "5px",
                    position: "relative",
                  }}
                >
                  {isRecommended && (
                    <div
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "4px",
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#D4978A",
                      }}
                    />
                  )}
                  <motion.span
                    animate={{ scale: exerciseType === e.label ? 1.2 : 1 }}
                    style={{ fontSize: "1.4rem" }}
                  >
                    {e.emoji}
                  </motion.span>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      color: exerciseType === e.label ? "#A05C5C" : "#8C6B63",
                      fontWeight: exerciseType === e.label ? 600 : 400,
                    }}
                  >
                    {e.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
          <p
            style={{ fontSize: "0.65rem", color: "#D4978A", marginTop: "10px" }}
          >
            · Recommended for your {phase.toLowerCase()} phase
          </p>
        </motion.div>

        {/* Duration */}
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
              marginBottom: "16px",
            }}
          >
            Duration
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
            }}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setDuration(Math.max(5, duration - 5))}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "#F5EAE8",
                border: "none",
                fontSize: "1.4rem",
                color: "#C17B7B",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              −
            </motion.button>
            <div style={{ textAlign: "center" }}>
              <motion.div
                key={duration}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "3rem",
                  fontWeight: 700,
                  color: "#2C1810",
                  lineHeight: 1,
                }}
              >
                {duration}
              </motion.div>
              <span style={{ fontSize: "0.82rem", color: "#B09A95" }}>
                minutes
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setDuration(Math.min(180, duration + 5))}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "#F5EAE8",
                border: "none",
                fontSize: "1.4rem",
                color: "#C17B7B",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              +
            </motion.button>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              marginTop: "14px",
            }}
          >
            {[15, 20, 30, 45, 60].map((m) => (
              <motion.button
                key={m}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDuration(m)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "100px",
                  border: "1px solid",
                  borderColor: duration === m ? "#C17B7B" : "#EDE0D8",
                  background: duration === m ? "#F5EAE8" : "#fff",
                  fontSize: "0.72rem",
                  color: duration === m ? "#A05C5C" : "#8C6B63",
                  fontWeight: duration === m ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {m}m
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Intensity */}
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
              marginBottom: "14px",
            }}
          >
            Intensity
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
            }}
          >
            {intensityOptions.map((opt) => (
              <motion.button
                key={opt.label}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIntensity(opt.label)}
                style={{
                  padding: "16px 8px",
                  borderRadius: "14px",
                  border: "1px solid",
                  borderColor: intensity === opt.label ? "#C17B7B" : "#EDE0D8",
                  background: intensity === opt.label ? "#F5EAE8" : "#FAF7F5",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <motion.span
                  animate={{ scale: intensity === opt.label ? 1.2 : 1 }}
                  style={{ fontSize: "1.5rem" }}
                >
                  {opt.emoji}
                </motion.span>
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: intensity === opt.label ? "#A05C5C" : "#8C6B63",
                  }}
                >
                  {opt.label}
                </span>
                <span style={{ fontSize: "0.6rem", color: "#B09A95" }}>
                  {opt.desc}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.4 }}
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
            Notes
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did it feel?"
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
              height: "72px",
            }}
          />
        </motion.div>

        {/* Save */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving || !exerciseType || !intensity}
          style={{
            width: "100%",
            background:
              saving || !exerciseType || !intensity ? "#EDE0D8" : "#C17B7B",
            color: saving || !exerciseType || !intensity ? "#B09A95" : "#fff",
            border: "none",
            borderRadius: "100px",
            padding: "16px",
            fontSize: "0.95rem",
            fontWeight: 600,
            cursor:
              saving || !exerciseType || !intensity ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving..." : "Log Exercise 🏃"}
        </motion.button>

        {/* Weekly chart */}
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
              marginBottom: "16px",
            }}
          >
            This Week
          </p>
          <div
            style={{
              display: "flex",
              gap: "6px",
              alignItems: "flex-end",
              height: "80px",
              marginBottom: "14px",
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
                <div
                  style={{
                    flex: 1,
                    width: "100%",
                    display: "flex",
                    alignItems: "flex-end",
                  }}
                >
                  {day.mins > 0 ? (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.mins / maxMins) * 100}%` }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      style={{
                        width: "100%",
                        borderRadius: "6px 6px 0 0",
                        background: day.isToday ? "#C17B7B" : "#E8B4B4",
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
            }}
          >
            {[
              { val: workoutsWeek, label: "Workouts" },
              { val: `${totalMinsWeek}m`, label: "Total mins" },
              { val: `🔥${workoutsWeek}`, label: "Day streak" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "#FAF7F5",
                  borderRadius: "14px",
                  padding: "12px 8px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: "#C17B7B",
                  }}
                >
                  {stat.val}
                </div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "#B09A95",
                    marginTop: "2px",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* History */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
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
              Recent Workouts
            </p>
            {history.slice(0, 5).map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
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
                    {exerciseEmojis[log.exerciseType] || "🏃"}
                  </span>
                  <div>
                    <p
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 600,
                        color: "#2C1810",
                      }}
                    >
                      {log.exerciseType}
                    </p>
                    <p
                      style={{
                        fontSize: "0.72rem",
                        color: "#B09A95",
                        marginTop: "1px",
                      }}
                    >
                      {new Date(log.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      · {log.intensity}
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
                  {log.duration} min
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
