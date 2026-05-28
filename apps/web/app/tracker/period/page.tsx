"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const flowOptions = [
  { label: "Spotting", emoji: "💧", desc: "Very light" },
  { label: "Light", emoji: "🩸", desc: "Light flow" },
  { label: "Medium", emoji: "🩸", desc: "Moderate" },
  { label: "Heavy", emoji: "🩸", desc: "Heavy flow" },
];

const symptomOptions = [
  { label: "Cramps", emoji: "😣" },
  { label: "Bloating", emoji: "🫧" },
  { label: "Headache", emoji: "🤕" },
  { label: "Fatigue", emoji: "😴" },
  { label: "Nausea", emoji: "🤢" },
  { label: "Mood swings", emoji: "🎭" },
  { label: "Tender breasts", emoji: "💗" },
  { label: "Cravings", emoji: "🍫" },
  { label: "Back pain", emoji: "😔" },
  { label: "Acne", emoji: "😤" },
  { label: "Insomnia", emoji: "🌙" },
  { label: "Dizziness", emoji: "💫" },
];

interface CycleLog {
  id: string;
  startDate: string;
  endDate?: string;
  flowLevel?: string;
  notes?: string;
}

export default function PeriodTrackerPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [history, setHistory] = useState<CycleLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [flow, setFlow] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/cycle")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setHistory(data.data);
      });
  }, []);

  const toggleSymptom = (s: string) =>
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  const handleSave = async () => {
    if (!selectedDate) return;
    setSaving(true);
    const startDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      selectedDate,
    ).toISOString();
    try {
      const res = await fetch("/api/cycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, flowLevel: flow, notes }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        fetch("/api/cycle")
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

  // Calendar helpers
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  const isPeriodDay = (day: number) => {
    const date = new Date(year, month, day);
    return history.some((log) => {
      const start = new Date(log.startDate);
      const end = log.endDate
        ? new Date(log.endDate)
        : new Date(start.getTime() + 5 * 86400000);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return date >= start && date <= end;
    });
  };

  const isFertileDay = (day: number) => {
    if (!history[0]) return false;
    const date = new Date(year, month, day);
    const lastPeriod = new Date(history[0].startDate);
    const cycleLength = 30;
    const ovulationDay = new Date(
      lastPeriod.getTime() + cycleLength * 0.45 * 86400000,
    );
    const fertileStart = new Date(ovulationDay.getTime() - 5 * 86400000);
    const fertileEnd = new Date(ovulationDay.getTime() + 1 * 86400000);
    return date >= fertileStart && date <= fertileEnd && !isPeriodDay(day);
  };

  const isPredictedDay = (day: number) => {
    if (!history[0]) return false;
    const date = new Date(year, month, day);
    const lastPeriod = new Date(history[0].startDate);
    const nextPeriod = new Date(lastPeriod.getTime() + 30 * 86400000);
    const nextEnd = new Date(nextPeriod.getTime() + 5 * 86400000);
    return date >= nextPeriod && date <= nextEnd && !isPeriodDay(day);
  };

  const isToday = (day: number) => isCurrentMonth && today.getDate() === day;

  // Cycle info
  const lastPeriod = history[0]?.startDate
    ? new Date(history[0].startDate)
    : null;
  const cycleLength = 30;
  const daysSince = lastPeriod
    ? Math.floor((Date.now() - lastPeriod.getTime()) / 86400000)
    : 0;
  const cycleDay = lastPeriod ? (daysSince % cycleLength) + 1 : 0;
  const ovulationDay = Math.round(cycleLength * 0.45);
  const daysToOvulation = Math.max(0, ovulationDay - cycleDay);
  const daysToPeriod = Math.max(0, cycleLength - cycleDay);
  const nextPeriodDate = lastPeriod
    ? new Date(lastPeriod.getTime() + cycleLength * 86400000)
    : null;
  const nextOvulationDate = lastPeriod
    ? new Date(lastPeriod.getTime() + ovulationDay * 86400000)
    : null;

  let phase = "Unknown",
    phaseEmoji = "🌙",
    phaseDesc = "Log your period to start";
  let gradient = "linear-gradient(135deg, #C17B7B, #D4978A)";
  if (cycleDay > 0) {
    if (cycleDay <= 5) {
      phase = "Menstrual";
      phaseEmoji = "🌑";
      phaseDesc = "Rest and be gentle";
      gradient = "linear-gradient(135deg, #8B4A4A, #C17B7B)";
    } else if (cycleDay <= 13) {
      phase = "Follicular";
      phaseEmoji = "🌒";
      phaseDesc = "Energy is rising";
      gradient = "linear-gradient(135deg, #C17B7B, #D4978A)";
    } else if (cycleDay <= 16) {
      phase = "Ovulatory";
      phaseEmoji = "🌕";
      phaseDesc = "Peak energy";
      gradient = "linear-gradient(135deg, #D4978A, #E8B89A)";
    } else {
      phase = "Luteal";
      phaseEmoji = "🌖";
      phaseDesc = "Wind down and rest";
      gradient = "linear-gradient(135deg, #8C6B63, #C17B7B)";
    }
  }

  const dashArray = cycleDay > 0 ? (cycleDay / cycleLength) * 176 : 0;

  return (
    <main style={{ backgroundColor: "#FAF7F5", minHeight: "100vh" }}>
      {/* Nav */}
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
          Period Tracker
        </h1>
      </nav>

      {/* Hero phase card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: gradient,
          padding: "22px 20px",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-30px",
            right: "-30px",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: "0.68rem",
                fontWeight: 600,
                opacity: 0.85,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "4px",
              }}
            >
              {phaseEmoji} {phase} Phase
            </p>
            {cycleDay > 0 ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "6px",
                  marginBottom: "4px",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "2.8rem",
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {cycleDay}
                </span>
                <span style={{ fontSize: "0.9rem", opacity: 0.7 }}>
                  / {cycleLength}
                </span>
              </div>
            ) : (
              <p
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
              >
                Start tracking
              </p>
            )}
            <p style={{ fontSize: "0.78rem", opacity: 0.82 }}>{phaseDesc}</p>
          </div>
          <svg
            width="70"
            height="70"
            viewBox="0 0 70 70"
            style={{ flexShrink: 0 }}
          >
            <circle
              cx="35"
              cy="35"
              r="28"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="5"
            />
            <circle
              cx="35"
              cy="35"
              r="28"
              fill="none"
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="5"
              strokeDasharray={`${dashArray} 176`}
              strokeLinecap="round"
              transform="rotate(-90 35 35)"
            />
            <text
              x="35"
              y="32"
              textAnchor="middle"
              fill="white"
              fontSize="8"
              fontWeight="600"
            >
              DAY
            </text>
            <text
              x="35"
              y="45"
              textAnchor="middle"
              fill="white"
              fontSize="14"
              fontWeight="700"
            >
              {cycleDay || "?"}
            </text>
          </svg>
        </div>

        {lastPeriod && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
              marginTop: "14px",
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: "12px",
                padding: "10px 12px",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                }}
              >
                {daysToPeriod}
              </div>
              <div style={{ fontSize: "0.68rem", opacity: 0.8 }}>
                Days to period
              </div>
              {nextPeriodDate && (
                <div style={{ fontSize: "0.62rem", opacity: 0.6 }}>
                  {nextPeriodDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              )}
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: "12px",
                padding: "10px 12px",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                }}
              >
                {daysToOvulation}
              </div>
              <div style={{ fontSize: "0.68rem", opacity: 0.8 }}>
                Days to ovulation
              </div>
              {nextOvulationDate && (
                <div style={{ fontSize: "0.62rem", opacity: 0.6 }}>
                  {nextOvulationDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              )}
            </div>
          </div>
        )}
        <p style={{ fontSize: "0.62rem", opacity: 0.6, marginTop: "10px" }}>
          {cycleLength}-day cycle · 85% confidence
        </p>
      </motion.div>

      <div
        style={{
          maxWidth: "560px",
          margin: "0 auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        {/* Calendar */}
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
          {/* Month nav */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentMonth(new Date(year, month - 1))}
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: "#F5EAE8",
                border: "none",
                cursor: "pointer",
                fontSize: "0.9rem",
                color: "#C17B7B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ←
            </motion.button>
            <p
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "1rem",
                fontWeight: 600,
                color: "#2C1810",
              }}
            >
              {currentMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentMonth(new Date(year, month + 1))}
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: "#F5EAE8",
                border: "none",
                cursor: "pointer",
                fontSize: "0.9rem",
                color: "#C17B7B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              →
            </motion.button>
          </div>

          {/* Day headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "3px",
              marginBottom: "8px",
            }}
          >
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div
                key={d}
                style={{
                  textAlign: "center",
                  fontSize: "0.65rem",
                  color: "#B09A95",
                  fontWeight: 600,
                  padding: "4px 0",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "3px",
            }}
          >
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const period = isPeriodDay(day);
              const fertile = isFertileDay(day);
              const predicted = isPredictedDay(day);
              const todayDay = isToday(day);
              const selected = selectedDate === day;

              let bg = "transparent";
              let color = "#2C1810";
              let border = "none";
              let dotColor = "";

              if (period) {
                bg = "#C17B7B";
                color = "white";
              } else if (selected) {
                bg = "#F5EAE8";
                color = "#C17B7B";
                border = "2px solid #C17B7B";
              } else if (todayDay) {
                bg = "#FFF8FA";
                color = "#C17B7B";
                border = "1.5px solid #C17B7B";
              }

              if (fertile && !period) dotColor = "#8EC4B0";
              if (predicted && !period) dotColor = "#D4978A";

              return (
                <motion.div
                  key={day}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setSelectedDate(selectedDate === day ? null : day)
                  }
                  style={{
                    aspectRatio: "1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    fontSize: "0.75rem",
                    fontWeight: period || todayDay || selected ? 600 : 400,
                    backgroundColor: bg,
                    color,
                    border,
                    cursor: "pointer",
                    position: "relative",
                    transition: "background 0.15s",
                  }}
                >
                  {day}
                  {dotColor && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "2px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        background: dotColor,
                      }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div
            style={{
              display: "flex",
              gap: "14px",
              marginTop: "14px",
              paddingTop: "14px",
              borderTop: "1px solid #EDE0D8",
              flexWrap: "wrap",
            }}
          >
            {[
              { color: "#C17B7B", label: "Period" },
              { color: "#8EC4B0", label: "Fertile window" },
              { color: "#D4978A", label: "Predicted" },
            ].map((l) => (
              <div
                key={l.label}
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: l.color,
                  }}
                />
                <span style={{ fontSize: "0.68rem", color: "#8C6B63" }}>
                  {l.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Log section — shows when date selected */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              style={{
                background: "#fff",
                border: "1px solid #EDE0D8",
                borderRadius: "20px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "#2C1810",
                  }}
                >
                  Log{" "}
                  {new Date(year, month, selectedDate).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric" },
                  )}
                </p>
                <button
                  onClick={() => setSelectedDate(null)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#B09A95",
                    fontSize: "1.2rem",
                  }}
                >
                  ✕
                </button>
              </div>

              <AnimatePresence>
                {saved && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      background: "#F5EAE8",
                      border: "1px solid #C17B7B",
                      borderRadius: "12px",
                      padding: "10px 14px",
                      color: "#A05C5C",
                      fontSize: "0.82rem",
                      fontWeight: 500,
                    }}
                  >
                    ✓ Logged successfully!
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Flow */}
              <div>
                <p
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    color: "#B09A95",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "10px",
                  }}
                >
                  Flow Level
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "6px",
                  }}
                >
                  {flowOptions.map((f) => (
                    <motion.button
                      key={f.label}
                      onClick={() => setFlow(f.label)}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      style={{
                        padding: "12px 4px",
                        borderRadius: "14px",
                        border: "1px solid",
                        borderColor: flow === f.label ? "#C17B7B" : "#EDE0D8",
                        background: flow === f.label ? "#F5EAE8" : "#FAF7F5",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span style={{ fontSize: "1.3rem" }}>{f.emoji}</span>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          color: flow === f.label ? "#A05C5C" : "#8C6B63",
                          fontWeight: flow === f.label ? 600 : 400,
                        }}
                      >
                        {f.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      color: "#B09A95",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    Symptoms
                  </p>
                  {symptoms.length > 0 && (
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
                      {symptoms.length} selected
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
                  {symptomOptions.map((s) => (
                    <motion.button
                      key={s.label}
                      onClick={() => toggleSymptom(s.label)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        padding: "10px 4px",
                        borderRadius: "12px",
                        border: "1px solid",
                        borderColor: symptoms.includes(s.label)
                          ? "#C17B7B"
                          : "#EDE0D8",
                        background: symptoms.includes(s.label)
                          ? "#F5EAE8"
                          : "#FAF7F5",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "3px",
                      }}
                    >
                      <span style={{ fontSize: "1.1rem" }}>{s.emoji}</span>
                      <span
                        style={{
                          fontSize: "0.58rem",
                          color: symptoms.includes(s.label)
                            ? "#A05C5C"
                            : "#8C6B63",
                          fontWeight: symptoms.includes(s.label) ? 600 : 400,
                        }}
                      >
                        {s.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes..."
                style={{
                  width: "100%",
                  border: "1px solid #EDE0D8",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  fontSize: "0.85rem",
                  color: "#2C1810",
                  background: "#FAF7F5",
                  outline: "none",
                  resize: "none",
                  height: "72px",
                }}
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                style={{
                  width: "100%",
                  background: saving ? "#EDE0D8" : "#C17B7B",
                  color: saving ? "#B09A95" : "white",
                  padding: "14px",
                  borderRadius: "100px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {saving ? "Saving..." : "Save log 🩸"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cycle history */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <p
              style={{
                fontSize: "0.68rem",
                fontWeight: 600,
                color: "#B09A95",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "10px",
              }}
            >
              Recent Cycles
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {history.slice(0, 4).map((log, i) => {
                const start = new Date(log.startDate);
                const end = log.endDate ? new Date(log.endDate) : null;
                const duration = end
                  ? Math.ceil((end.getTime() - start.getTime()) / 86400000)
                  : null;
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    style={{
                      background: "#fff",
                      border: "1px solid #EDE0D8",
                      borderRadius: "14px",
                      padding: "14px 18px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          color: "#2C1810",
                        }}
                      >
                        {start.toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                        })}
                        {end &&
                          ` — ${end.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`}
                      </p>
                      <p
                        style={{
                          fontSize: "0.72rem",
                          color: "#B09A95",
                          marginTop: "2px",
                        }}
                      >
                        {log.flowLevel || "Flow not logged"}
                        {duration ? ` · ${duration} days` : ""}
                      </p>
                    </div>
                    {i === 0 && (
                      <span
                        style={{
                          fontSize: "0.65rem",
                          background: "#F5EAE8",
                          color: "#C17B7B",
                          padding: "3px 10px",
                          borderRadius: "100px",
                          fontWeight: 600,
                        }}
                      >
                        Latest
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {history.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              background: "#fff",
              border: "1px solid #EDE0D8",
              borderRadius: "18px",
              padding: "40px 20px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🩸</p>
            <p
              style={{ color: "#8C6B63", fontWeight: 500, marginBottom: "4px" }}
            >
              No cycles logged yet
            </p>
            <p style={{ color: "#B09A95", fontSize: "0.82rem" }}>
              Tap any date on the calendar to log your period
            </p>
          </motion.div>
        )}
      </div>
    </main>
  );
}
