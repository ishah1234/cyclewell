"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const physicalSymptoms = [
  { label: "Cramps", emoji: "😣" },
  { label: "Bloating", emoji: "🫧" },
  { label: "Fatigue", emoji: "😴" },
  { label: "Headache", emoji: "🤕" },
  { label: "Nausea", emoji: "🤢" },
  { label: "Back pain", emoji: "😔" },
  { label: "Breast tenderness", emoji: "💗" },
  { label: "Weight gain", emoji: "⚖️" },
  { label: "Dizziness", emoji: "💫" },
  { label: "Acne", emoji: "😤" },
  { label: "Hair loss", emoji: "💇" },
  { label: "Insomnia", emoji: "🌙" },
];

const moodSymptoms = [
  { label: "Mood swings", emoji: "🎭" },
  { label: "Anxiety", emoji: "😰" },
  { label: "Brain fog", emoji: "🌫️" },
  { label: "Low energy", emoji: "⚡" },
  { label: "Irritability", emoji: "😤" },
];

const phaseSymptoms: Record<string, string> = {
  Menstrual:
    "Cramps, bloating, fatigue, and low mood are common. Be gentle with yourself.",
  Follicular:
    "Energy is rising. You may notice reduced symptoms and improved mood.",
  Ovulatory:
    "Peak energy phase. Some may experience mild bloating or breast tenderness.",
  Luteal:
    "PMS symptoms like mood swings, bloating, and cravings are common now.",
  Unknown: "Log your period to see phase-specific symptom predictions.",
};

interface SymptomLog {
  id: string;
  date: string;
  symptoms: string[];
  severity: number;
  notes?: string;
}

export default function SymptomsTrackerPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [severity, setSeverity] = useState(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<SymptomLog[]>([]);
  const [cycleDay, setCycleDay] = useState(0);
  const [phase, setPhase] = useState("Unknown");

  useEffect(() => {
    fetch("/api/symptoms")
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

  const toggle = (s: string) =>
    setSelected((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  const handleSave = async () => {
    if (selected.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: selected,
          severity,
          notes,
          date: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        setSelected([]);
        setSeverity(0);
        setNotes("");
        fetch("/api/symptoms")
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

  // Pattern analysis
  const symptomCounts: Record<string, number> = {};
  history.forEach((log) =>
    log.symptoms.forEach((s) => {
      symptomCounts[s] = (symptomCounts[s] || 0) + 1;
    }),
  );
  const topSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

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

  const allSymptomEmojis: Record<string, string> = {
    ...Object.fromEntries(physicalSymptoms.map((s) => [s.label, s.emoji])),
    ...Object.fromEntries(moodSymptoms.map((s) => [s.label, s.emoji])),
  };

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
          Symptom Tracker
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
              ✓ Symptoms logged!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase banner */}
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
            Common symptoms right now
          </p>
          <p style={{ fontSize: "0.8rem", opacity: 0.85, lineHeight: 1.5 }}>
            {phaseSymptoms[phase]}
          </p>
        </motion.div>

        {/* Physical symptoms */}
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
              Physical Symptoms
            </p>
            {selected.filter((s) =>
              physicalSymptoms.map((p) => p.label).includes(s),
            ).length > 0 && (
              <span
                style={{
                  fontSize: "0.68rem",
                  background: "#F5EAE8",
                  color: "#C17B7B",
                  padding: "2px 8px",
                  borderRadius: "100px",
                  fontWeight: 600,
                }}
              >
                {
                  selected.filter((s) =>
                    physicalSymptoms.map((p) => p.label).includes(s),
                  ).length
                }{" "}
                selected
              </span>
            )}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "6px",
            }}
          >
            {physicalSymptoms.map((s, i) => (
              <motion.button
                key={s.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggle(s.label)}
                style={{
                  padding: "12px 4px",
                  borderRadius: "14px",
                  border: "1px solid",
                  borderColor: selected.includes(s.label)
                    ? "#C17B7B"
                    : "#EDE0D8",
                  background: selected.includes(s.label)
                    ? "#F5EAE8"
                    : "#FAF7F5",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.15s",
                }}
              >
                <motion.span
                  animate={{ scale: selected.includes(s.label) ? 1.2 : 1 }}
                  style={{ fontSize: "1.2rem" }}
                >
                  {s.emoji}
                </motion.span>
                <span
                  style={{
                    fontSize: "0.58rem",
                    color: selected.includes(s.label) ? "#A05C5C" : "#8C6B63",
                    fontWeight: selected.includes(s.label) ? 600 : 400,
                    textAlign: "center",
                  }}
                >
                  {s.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Mood symptoms */}
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
              marginBottom: "14px",
            }}
          >
            Mood Symptoms
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "6px",
            }}
          >
            {moodSymptoms.map((s, i) => (
              <motion.button
                key={s.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggle(s.label)}
                style={{
                  padding: "12px 4px",
                  borderRadius: "14px",
                  border: "1px solid",
                  borderColor: selected.includes(s.label)
                    ? "#C17B7B"
                    : "#EDE0D8",
                  background: selected.includes(s.label)
                    ? "#F5EAE8"
                    : "#FAF7F5",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <motion.span
                  animate={{ scale: selected.includes(s.label) ? 1.2 : 1 }}
                  style={{ fontSize: "1.2rem" }}
                >
                  {s.emoji}
                </motion.span>
                <span
                  style={{
                    fontSize: "0.58rem",
                    color: selected.includes(s.label) ? "#A05C5C" : "#8C6B63",
                    fontWeight: selected.includes(s.label) ? 600 : 400,
                    textAlign: "center",
                  }}
                >
                  {s.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Severity */}
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
              Severity
            </p>
            {severity > 0 && (
              <motion.span
                key={severity}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                style={{
                  fontSize: "0.72rem",
                  background: "#F5EAE8",
                  color: "#C17B7B",
                  padding: "2px 10px",
                  borderRadius: "100px",
                  fontWeight: 600,
                }}
              >
                {severity === 1
                  ? "Mild"
                  : severity === 2
                    ? "Noticeable"
                    : severity === 3
                      ? "Moderate"
                      : severity === 4
                        ? "Strong"
                        : "Severe"}
              </motion.span>
            )}
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <motion.button
                key={n}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSeverity(n)}
                style={{
                  flex: 1,
                  padding: "12px 4px",
                  borderRadius: "12px",
                  border: "1px solid",
                  borderColor: severity === n ? "#C17B7B" : "#EDE0D8",
                  background: severity === n ? "#F5EAE8" : "#FAF7F5",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "2px",
                }}
              >
                <span
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: severity === n ? "#C17B7B" : "#8C6B63",
                  }}
                >
                  {n}
                </span>
                <span style={{ fontSize: "0.55rem", color: "#B09A95" }}>
                  {n === 1
                    ? "Mild"
                    : n === 2
                      ? ""
                      : n === 3
                        ? "Moderate"
                        : n === 4
                          ? ""
                          : "Severe"}
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
            placeholder="Any additional notes..."
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
              height: "80px",
            }}
          />
        </motion.div>

        {/* Save button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving || selected.length === 0}
          style={{
            width: "100%",
            background: saving || selected.length === 0 ? "#EDE0D8" : "#C17B7B",
            color: saving || selected.length === 0 ? "#B09A95" : "#fff",
            border: "none",
            borderRadius: "100px",
            padding: "16px",
            fontSize: "0.95rem",
            fontWeight: 600,
            cursor: saving || selected.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          {saving
            ? "Saving..."
            : `Log ${selected.length > 0 ? `${selected.length} Symptom${selected.length > 1 ? "s" : ""}` : "Symptoms"} 📋`}
        </motion.button>

        {/* Patterns */}
        {topSymptoms.length > 0 && (
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
                marginBottom: "14px",
              }}
            >
              Symptom Patterns
            </p>
            {topSymptoms.map(([sym, count], i) => (
              <motion.div
                key={sym}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 0",
                  borderBottom:
                    i < topSymptoms.length - 1 ? "1px solid #EDE0D8" : "none",
                }}
              >
                <span style={{ fontSize: "1.3rem" }}>
                  {allSymptomEmojis[sym] || "📋"}
                </span>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: "#2C1810",
                    }}
                  >
                    {sym}
                  </p>
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "#B09A95",
                      marginTop: "1px",
                    }}
                  >
                    Logged {count} time{count > 1 ? "s" : ""}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "3px" }}>
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div
                      key={j}
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: j < count ? "#C17B7B" : "#EDE0D8",
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

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
              Recent Logs
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
                  alignItems: "flex-start",
                  padding: "12px 0",
                  borderBottom:
                    i < Math.min(history.length, 5) - 1
                      ? "1px solid #EDE0D8"
                      : "none",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "#2C1810",
                      marginBottom: "6px",
                    }}
                  >
                    {new Date(log.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <div
                    style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}
                  >
                    {log.symptoms.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        style={{
                          fontSize: "0.68rem",
                          background: "#F5EAE8",
                          color: "#C17B7B",
                          padding: "2px 8px",
                          borderRadius: "100px",
                        }}
                      >
                        {allSymptomEmojis[s] || ""} {s}
                      </span>
                    ))}
                    {log.symptoms.length > 3 && (
                      <span
                        style={{
                          fontSize: "0.68rem",
                          background: "#EDE0D8",
                          color: "#8C6B63",
                          padding: "2px 8px",
                          borderRadius: "100px",
                        }}
                      >
                        +{log.symptoms.length - 3}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.68rem",
                    background: "#F5EAE8",
                    color: "#C17B7B",
                    padding: "3px 10px",
                    borderRadius: "100px",
                    fontWeight: 600,
                    flexShrink: 0,
                    marginLeft: "8px",
                  }}
                >
                  Severity {log.severity}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
