"use client";

import { useState } from "react";
import Link from "next/link";

const physicalSymptoms = [
  "Cramps",
  "Bloating",
  "Headache",
  "Back pain",
  "Fatigue",
  "Nausea",
  "Acne",
  "Hair loss",
  "Breast tenderness",
  "Weight gain",
  "Dizziness",
  "Insomnia",
];

const moodSymptoms = [
  "Mood swings",
  "Anxiety",
  "Brain fog",
  "Irritability",
  "Low energy",
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

export default function SymptomsTrackerPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState(3);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (s: string) =>
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          severity,
          notes,
          date: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setSaved(true);
        setSelectedSymptoms([]);
        setSeverity(3);
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
          Symptom Tracker
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
            ✓ Symptoms logged successfully
          </div>
        )}

        {/* Physical symptoms */}
        <div style={card}>
          <p style={labelStyle}>Physical Symptoms</p>
          <div className="flex flex-wrap gap-2">
            {physicalSymptoms.map((s) => (
              <button
                key={s}
                onClick={() => toggleSymptom(s)}
                style={selectedSymptoms.includes(s) ? chipActive : chipInactive}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Mood symptoms */}
        <div style={card}>
          <p style={labelStyle}>Mood Symptoms</p>
          <div className="flex flex-wrap gap-2">
            {moodSymptoms.map((s) => (
              <button
                key={s}
                onClick={() => toggleSymptom(s)}
                style={selectedSymptoms.includes(s) ? chipActive : chipInactive}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Severity */}
        <div style={card}>
          <p style={labelStyle}>Severity</p>
          <div className="flex justify-between items-center mb-3">
            <span style={{ fontSize: "0.82rem", color: "#B09A95" }}>Mild</span>
            <span
              style={{
                fontSize: "1.4rem",
                fontWeight: 700,
                color: "#C17B7B",
                fontFamily: "var(--font-playfair)",
              }}
            >
              {severity}
            </span>
            <span style={{ fontSize: "0.82rem", color: "#B09A95" }}>
              Severe
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            value={severity}
            onChange={(e) => setSeverity(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#C17B7B" }}
          />
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
            placeholder="Any additional notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={loading || selectedSymptoms.length === 0}
          style={{
            width: "100%",
            backgroundColor:
              loading || selectedSymptoms.length === 0 ? "#EDE0D8" : "#C17B7B",
            color:
              loading || selectedSymptoms.length === 0 ? "#B09A95" : "#FFFFFF",
            padding: "16px",
            borderRadius: "100px",
            fontSize: "0.95rem",
            fontWeight: 600,
            border: "none",
            cursor:
              loading || selectedSymptoms.length === 0
                ? "not-allowed"
                : "pointer",
            transition: "all 0.2s",
          }}
        >
          {loading ? "Saving..." : "Log Symptoms"}
        </button>
      </div>
    </main>
  );
}
