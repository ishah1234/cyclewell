"use client";

import { useState } from "react";
import Link from "next/link";

const hormones = [
  {
    key: "lh",
    label: "LH",
    unit: "mIU/mL",
    description: "Luteinizing Hormone",
  },
  {
    key: "fsh",
    label: "FSH",
    unit: "mIU/mL",
    description: "Follicle Stimulating Hormone",
  },
  {
    key: "amh",
    label: "AMH",
    unit: "ng/mL",
    description: "Anti-Müllerian Hormone",
  },
  {
    key: "estrogen",
    label: "Estrogen",
    unit: "pg/mL",
    description: "Estradiol (E2)",
  },
  {
    key: "testosterone",
    label: "Testosterone",
    unit: "ng/dL",
    description: "Total Testosterone",
  },
  {
    key: "insulin",
    label: "Insulin",
    unit: "μIU/mL",
    description: "Fasting Insulin",
  },
];

const references = [
  { label: "LH", range: "2–15 mIU/mL", note: "Often elevated in PCOS" },
  { label: "FSH", range: "3–10 mIU/mL", note: "LH:FSH ratio >2 suggests PCOS" },
  { label: "AMH", range: "1–3.5 ng/mL", note: "Often elevated in PCOS" },
  { label: "Estrogen", range: "20–350 pg/mL", note: "Varies by cycle phase" },
  {
    label: "Testosterone",
    range: "15–70 ng/dL",
    note: "Often elevated in PCOS",
  },
  {
    label: "Insulin",
    range: "2–25 μIU/mL",
    note: "Insulin resistance common in PCOS",
  },
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

export default function HormoneTrackerPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hormone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(
            Object.entries(values).map(([k, v]) => [
              k,
              v ? parseFloat(v) : null,
            ]),
          ),
          date: date || new Date().toISOString(),
          notes,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setValues({});
        setDate("");
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
          Hormone Tracker
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
            ✓ Hormone levels logged successfully
          </div>
        )}

        {/* Info */}
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
            💡 Log your hormone levels from your blood test results. All fields
            are optional — only fill in what you have.
          </p>
        </div>

        {/* Test date */}
        <div style={card}>
          <p style={labelStyle}>Test Date</p>
          <input
            type="date"
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
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Hormone values */}
        <div style={card}>
          <p style={labelStyle}>Hormone Values</p>
          <div className="flex flex-col gap-4">
            {hormones.map((h) => (
              <div key={h.key}>
                <label
                  style={{
                    fontSize: "0.85rem",
                    color: "#8C6B63",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "#2C1810" }}>
                    {h.label}
                  </span>
                  <span style={{ color: "#B09A95" }}>
                    {" "}
                    — {h.description} ({h.unit})
                  </span>
                </label>
                <input
                  type="number"
                  step="0.01"
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
                  placeholder={`Enter ${h.label} value`}
                  value={values[h.key] || ""}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [h.key]: e.target.value }))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Reference ranges */}
        <div style={card}>
          <p style={labelStyle}>Reference Ranges</p>
          <div className="flex flex-col">
            {references.map((r, i) => (
              <div
                key={r.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom:
                    i < references.length - 1 ? "1px solid #EDE0D8" : "none",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: "#2C1810",
                    }}
                  >
                    {r.label}
                  </p>
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "#B09A95",
                      marginTop: "2px",
                    }}
                  >
                    {r.note}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: "0.78rem",
                    backgroundColor: "#F5EAE8",
                    color: "#C17B7B",
                    padding: "4px 12px",
                    borderRadius: "100px",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.range}
                </span>
              </div>
            ))}
          </div>
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
            placeholder="Any notes about your results..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={loading || Object.keys(values).length === 0}
          style={{
            width: "100%",
            backgroundColor:
              loading || Object.keys(values).length === 0
                ? "#EDE0D8"
                : "#C17B7B",
            color:
              loading || Object.keys(values).length === 0
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
          {loading ? "Saving..." : "Log Hormone Levels"}
        </button>
      </div>
    </main>
  );
}
