"use client";

import { useState } from "react";
import Link from "next/link";

const exerciseTypes = [
  { emoji: "🧘", label: "Yoga" },
  { emoji: "🚶", label: "Walking" },
  { emoji: "🏋️", label: "Strength" },
  { emoji: "🏃", label: "Cardio" },
  { emoji: "🤸", label: "Stretching" },
  { emoji: "🏊", label: "Swimming" },
];

const intensityOptions = ["Low", "Medium", "High"];

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

const chipActive = {
  padding: "8px 20px",
  borderRadius: "100px",
  border: "1px solid #C17B7B",
  backgroundColor: "#F5EAE8",
  color: "#A05C5C",
  fontSize: "0.85rem",
  fontWeight: 500,
  cursor: "pointer",
};

const chipInactive = {
  padding: "8px 20px",
  borderRadius: "100px",
  border: "1px solid #EDE0D8",
  backgroundColor: "#FFFFFF",
  color: "#8C6B63",
  fontSize: "0.85rem",
  cursor: "pointer",
};

export default function ExerciseTrackerPage() {
  const [exerciseType, setExerciseType] = useState("");
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseType,
          duration: parseInt(duration),
          intensity,
          notes,
          date: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setSaved(true);
        setExerciseType("");
        setDuration("");
        setIntensity("");
        setNotes("");
      }
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
          Exercise Tracker
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
            ✓ Exercise logged successfully
          </div>
        )}

        {/* Exercise type */}
        <div style={card}>
          <p style={labelStyle}>Type of Exercise</p>
          <div className="grid grid-cols-3 gap-3">
            {exerciseTypes.map((e) => (
              <button
                key={e.label}
                onClick={() => setExerciseType(e.label)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  padding: "16px 8px",
                  borderRadius: "16px",
                  border:
                    exerciseType === e.label
                      ? "1px solid #C17B7B"
                      : "1px solid #EDE0D8",
                  backgroundColor:
                    exerciseType === e.label ? "#F5EAE8" : "#FFFFFF",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: "1.8rem" }}>{e.emoji}</span>
                <span
                  style={{
                    fontSize: "0.78rem",
                    color: exerciseType === e.label ? "#A05C5C" : "#8C6B63",
                    fontWeight: exerciseType === e.label ? 600 : 400,
                  }}
                >
                  {e.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div style={card}>
          <p style={labelStyle}>Duration</p>
          <input
            type="number"
            style={{
              width: "100%",
              border: "1px solid #EDE0D8",
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "0.9rem",
              color: "#2C1810",
              backgroundColor: "#FFFFFF",
              outline: "none",
            }}
            placeholder="Minutes (e.g. 30)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>

        {/* Intensity */}
        <div style={card}>
          <p style={labelStyle}>Intensity</p>
          <div className="flex gap-3">
            {intensityOptions.map((i) => (
              <button
                key={i}
                onClick={() => setIntensity(i)}
                style={intensity === i ? chipActive : chipInactive}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* PCOS tip */}
        <div
          style={{
            backgroundColor: "#F5EAE8",
            border: "1px solid #EDE0D8",
            borderRadius: "16px",
            padding: "16px 20px",
          }}
        >
          <p
            style={{ fontSize: "0.875rem", color: "#8C6B63", lineHeight: 1.6 }}
          >
            💡 Low to moderate intensity exercise like yoga and walking helps
            regulate insulin levels and reduce inflammation in PCOS.
          </p>
        </div>

        {/* Notes */}
        <div style={card}>
          <p style={labelStyle}>Notes</p>
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
              height: "96px",
            }}
            placeholder="How did it feel?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={loading || !exerciseType || !duration || !intensity}
          style={{
            width: "100%",
            backgroundColor:
              loading || !exerciseType || !duration || !intensity
                ? "#EDE0D8"
                : "#C17B7B",
            color:
              loading || !exerciseType || !duration || !intensity
                ? "#B09A95"
                : "#FFFFFF",
            padding: "16px",
            borderRadius: "100px",
            fontSize: "0.95rem",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {loading ? "Saving..." : "Log Exercise"}
        </button>
      </div>
    </main>
  );
}
