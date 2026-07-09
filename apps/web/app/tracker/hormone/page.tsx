"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const hormones = [
  {
    key: "lh",
    label: "LH",
    fullName: "Luteinizing Hormone",
    unit: "mIU/mL",
    min: 0,
    max: 20,
    normalMin: 2,
    normalMax: 15,
    pcosNote: "Often elevated in PCOS",
  },
  {
    key: "fsh",
    label: "FSH",
    fullName: "Follicle Stimulating Hormone",
    unit: "mIU/mL",
    min: 0,
    max: 20,
    normalMin: 3,
    normalMax: 10,
    pcosNote: "LH:FSH ratio >2 suggests PCOS",
  },
  {
    key: "amh",
    label: "AMH",
    fullName: "Anti-Müllerian Hormone",
    unit: "ng/mL",
    min: 0,
    max: 10,
    normalMin: 1,
    normalMax: 3.5,
    pcosNote: "Often elevated in PCOS",
  },
  {
    key: "estrogen",
    label: "Estrogen",
    fullName: "Estradiol (E2)",
    unit: "pg/mL",
    min: 0,
    max: 500,
    normalMin: 20,
    normalMax: 350,
    pcosNote: "Varies by cycle phase",
  },
  {
    key: "testosterone",
    label: "Testosterone",
    fullName: "Total Testosterone",
    unit: "ng/dL",
    min: 0,
    max: 150,
    normalMin: 15,
    normalMax: 70,
    pcosNote: "Often elevated in PCOS",
  },
  {
    key: "insulin",
    label: "Insulin",
    fullName: "Fasting Insulin",
    unit: "μIU/mL",
    min: 0,
    max: 50,
    normalMin: 2,
    normalMax: 25,
    pcosNote: "Insulin resistance common in PCOS",
  },
];

interface HormoneLog {
  id: string;
  date: string;
  lh?: number;
  fsh?: number;
  amh?: number;
  estrogen?: number;
  testosterone?: number;
  insulin?: number;
  notes?: string;
}

export default function HormoneTrackerPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<HormoneLog[]>([]);

  useEffect(() => {
    fetch("/api/hormone")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setHistory(data.data);
      });
  }, []);

  const getStatus = (key: string, val: number) => {
    const h = hormones.find((h) => h.key === key);
    if (!h) return null;
    if (val < h.normalMin)
      return { label: "Low", bg: "#FFF8E1", color: "#856C00" };
    if (val > h.normalMax)
      return { label: "High", bg: "#FCEBEB", color: "#A32D2D" };
    return { label: "Normal", bg: "#E1F5EE", color: "#0F6E56" };
  };

  const getMarkerPosition = (key: string, val: number) => {
    const h = hormones.find((h) => h.key === key);
    if (!h) return 0;
    return Math.min(100, Math.max(0, ((val - h.min) / (h.max - h.min)) * 100));
  };

  const handleSave = async () => {
    setSaving(true);
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
        setTimeout(() => setSaved(false), 3000);
        setValues({});
        setDate("");
        setNotes("");
        fetch("/api/hormone")
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

  const hasValues = Object.values(values).some((v) => v !== "");

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
          Hormone Tracker
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
              ✓ Hormone levels logged!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: "linear-gradient(135deg, #C17B7B, #D4978A)",
            borderRadius: "20px",
            padding: "22px",
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
              fontFamily: "var(--font-playfair)",
              fontSize: "1.1rem",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Track your hormone levels 🔬
          </p>
          <p style={{ fontSize: "0.82rem", opacity: 0.88, lineHeight: 1.6 }}>
            Log results from your blood tests. All fields are optional — fill in
            what you have. We'll show you how they compare to normal ranges.
          </p>
        </motion.div>

        {/* Test date */}
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
            Test Date
          </p>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: "100%",
              border: "1px solid #EDE0D8",
              borderRadius: "12px",
              padding: "12px 14px",
              fontSize: "0.9rem",
              color: "#2C1810",
              background: "#FAF7F5",
              outline: "none",
            }}
          />
        </motion.div>

        {/* Hormone inputs */}
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
            Hormone Values
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            {hormones.map((h, i) => {
              const val = values[h.key]
                ? parseFloat(values[h.key] ?? "0")
                : null;
              const status = val !== null ? getStatus(h.key, val) : null;
              const markerPos =
                val !== null ? getMarkerPosition(h.key, val) : null;
              const normalStartPct =
                ((h.normalMin - h.min) / (h.max - h.min)) * 100;
              const normalWidthPct =
                ((h.normalMax - h.normalMin) / (h.max - h.min)) * 100;

              return (
                <motion.div
                  key={h.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "6px",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          color: "#2C1810",
                        }}
                      >
                        {h.label}{" "}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "#B09A95" }}>
                        {h.fullName}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {status && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          style={{
                            fontSize: "0.65rem",
                            background: status.bg,
                            color: status.color,
                            padding: "2px 8px",
                            borderRadius: "100px",
                            fontWeight: 600,
                          }}
                        >
                          {status.label}
                        </motion.span>
                      )}
                      <span style={{ fontSize: "0.72rem", color: "#B09A95" }}>
                        {h.unit}
                      </span>
                    </div>
                  </div>

                  <input
                    type="number"
                    step="0.01"
                    value={values[h.key] || ""}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [h.key]: e.target.value,
                      }))
                    }
                    placeholder={`Enter ${h.label} value`}
                    style={{
                      width: "100%",
                      border: "1px solid #EDE0D8",
                      borderRadius: "12px",
                      padding: "10px 14px",
                      fontSize: "0.9rem",
                      color: "#2C1810",
                      background: "#FAF7F5",
                      outline: "none",
                      marginBottom: "8px",
                    }}
                  />

                  {/* Range bar */}
                  <div
                    style={{
                      position: "relative",
                      height: "6px",
                      background: "#EDE0D8",
                      borderRadius: "100px",
                    }}
                  >
                    {/* Normal range highlight */}
                    <div
                      style={{
                        position: "absolute",
                        left: `${normalStartPct}%`,
                        width: `${normalWidthPct}%`,
                        height: "100%",
                        background: "#8EC4B0",
                        borderRadius: "100px",
                        opacity: 0.5,
                      }}
                    />
                    {/* Value marker */}
                    {markerPos !== null && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                          position: "absolute",
                          left: `${markerPos}%`,
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          background: status?.color || "#C17B7B",
                          border: "2px solid #fff",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                        }}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "4px",
                    }}
                  >
                    <span style={{ fontSize: "0.6rem", color: "#B09A95" }}>
                      {h.min}
                    </span>
                    <span style={{ fontSize: "0.6rem", color: "#8EC4B0" }}>
                      Normal: {h.normalMin}–{h.normalMax}
                    </span>
                    <span style={{ fontSize: "0.6rem", color: "#B09A95" }}>
                      {h.max}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.65rem",
                      color: "#B09A95",
                      marginTop: "3px",
                    }}
                  >
                    {h.pcosNote}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Notes */}
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
              marginBottom: "12px",
            }}
          >
            Notes
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about your results or how you're feeling..."
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

        {/* Save */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving || !hasValues}
          style={{
            width: "100%",
            background: saving || !hasValues ? "#EDE0D8" : "#C17B7B",
            color: saving || !hasValues ? "#B09A95" : "#fff",
            border: "none",
            borderRadius: "100px",
            padding: "16px",
            fontSize: "0.95rem",
            fontWeight: 600,
            cursor: saving || !hasValues ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving..." : "Log Hormone Levels 🔬"}
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
              Past Results
            </p>
            {history.slice(0, 4).map((log, i) => {
              const loggedValues = hormones.filter(
                (h) =>
                  log[h.key as keyof HormoneLog] !== null &&
                  log[h.key as keyof HormoneLog] !== undefined,
              );
              const highValues = loggedValues.filter((h) => {
                const v = log[h.key as keyof HormoneLog] as number;
                return v > h.normalMax;
              });

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    padding: "12px 0",
                    borderBottom:
                      i < Math.min(history.length, 4) - 1
                        ? "1px solid #EDE0D8"
                        : "none",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#2C1810",
                        marginBottom: "6px",
                      }}
                    >
                      {new Date(log.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <div
                      style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}
                    >
                      {loggedValues.slice(0, 4).map((h) => (
                        <span
                          key={h.key}
                          style={{
                            fontSize: "0.68rem",
                            background: "#F5EAE8",
                            color: "#C17B7B",
                            padding: "2px 8px",
                            borderRadius: "100px",
                          }}
                        >
                          {h.label}: {log[h.key as keyof HormoneLog]}
                        </span>
                      ))}
                    </div>
                  </div>
                  {highValues.length > 0 ? (
                    <span
                      style={{
                        fontSize: "0.65rem",
                        background: "#FCEBEB",
                        color: "#A32D2D",
                        padding: "3px 8px",
                        borderRadius: "100px",
                        fontWeight: 600,
                        flexShrink: 0,
                        marginLeft: "8px",
                      }}
                    >
                      {highValues[0]?.label} High
                    </span>
                  ) : loggedValues.length > 0 ? (
                    <span
                      style={{
                        fontSize: "0.65rem",
                        background: "#E1F5EE",
                        color: "#0F6E56",
                        padding: "3px 8px",
                        borderRadius: "100px",
                        fontWeight: 600,
                        flexShrink: 0,
                        marginLeft: "8px",
                      }}
                    >
                      Normal
                    </span>
                  ) : null}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </main>
  );
}
