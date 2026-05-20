"use client";

import { useState } from "react";
import Link from "next/link";

const flowOptions = ["Spotting", "Light", "Medium", "Heavy"];
const symptomOptions = [
  "Cramps",
  "Bloating",
  "Headache",
  "Back pain",
  "Fatigue",
  "Nausea",
  "Acne",
  "Mood swings",
  "Breast tenderness",
  "Spotting",
];
const moodOptions = [
  "😊 Happy",
  "😌 Calm",
  "😢 Sad",
  "😰 Anxious",
  "😤 Irritable",
  "⚡ Energetic",
];

const card = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #EDE0D8",
  borderRadius: "20px",
  padding: "24px",
};

const inputStyle = {
  width: "100%",
  border: "1px solid #EDE0D8",
  borderRadius: "12px",
  padding: "12px 16px",
  fontSize: "0.9rem",
  color: "#2C1810",
  backgroundColor: "#FFFFFF",
  outline: "none",
};

const labelStyle = {
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "#B09A95",
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
  display: "block",
  marginBottom: "8px",
};

const chipActive = {
  padding: "8px 16px",
  borderRadius: "100px",
  border: "1px solid #C17B7B",
  backgroundColor: "#F5EAE8",
  color: "#A05C5C",
  fontSize: "0.85rem",
  fontWeight: 500,
  cursor: "pointer",
};

const chipInactive = {
  padding: "8px 16px",
  borderRadius: "100px",
  border: "1px solid #EDE0D8",
  backgroundColor: "#FFFFFF",
  color: "#8C6B63",
  fontSize: "0.85rem",
  cursor: "pointer",
};

export default function PeriodTrackerPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [flow, setFlow] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [mood, setMood] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (s: string) =>
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate, flowLevel: flow, notes }),
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
          Period Tracker
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
            ✓ Period logged successfully
          </div>
        )}

        {/* Dates */}
        <div style={card}>
          <p style={labelStyle}>Cycle Dates</p>
          <div className="flex flex-col gap-4">
            <div>
              <label
                style={{
                  ...labelStyle,
                  textTransform: "none",
                  fontSize: "0.85rem",
                  color: "#8C6B63",
                }}
              >
                Period start date
              </label>
              <input
                type="date"
                style={inputStyle}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label
                style={{
                  ...labelStyle,
                  textTransform: "none",
                  fontSize: "0.85rem",
                  color: "#8C6B63",
                }}
              >
                Period end date (optional)
              </label>
              <input
                type="date"
                style={inputStyle}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Flow */}
        <div style={card}>
          <p style={labelStyle}>Flow Level</p>
          <div className="flex gap-2 flex-wrap">
            {flowOptions.map((f) => (
              <button
                key={f}
                onClick={() => setFlow(f)}
                style={flow === f ? chipActive : chipInactive}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Symptoms */}
        <div style={card}>
          <p style={labelStyle}>Symptoms</p>
          <div className="flex gap-2 flex-wrap">
            {symptomOptions.map((s) => (
              <button
                key={s}
                onClick={() => toggleSymptom(s)}
                style={symptoms.includes(s) ? chipActive : chipInactive}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Mood */}
        <div style={card}>
          <p style={labelStyle}>Mood</p>
          <div className="flex gap-2 flex-wrap">
            {moodOptions.map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                style={mood === m ? chipActive : chipInactive}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={card}>
          <p style={labelStyle}>Notes</p>
          <textarea
            style={{ ...inputStyle, resize: "none", height: "96px" }}
            placeholder="Any notes about your cycle..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={loading || !startDate}
          style={{
            width: "100%",
            backgroundColor: loading || !startDate ? "#EDE0D8" : "#C17B7B",
            color: loading || !startDate ? "#B09A95" : "#FFFFFF",
            padding: "16px",
            borderRadius: "100px",
            fontSize: "0.95rem",
            fontWeight: 600,
            border: "none",
            cursor: loading || !startDate ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          {loading ? "Saving..." : "Log Period"}
        </button>
      </div>
    </main>
  );
}
