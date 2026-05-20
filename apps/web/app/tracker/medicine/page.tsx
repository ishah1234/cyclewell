"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const frequencyOptions = ["Daily", "Twice daily", "Weekly", "As needed"];
const timeOptions = ["Morning", "Afternoon", "Evening", "Night"];

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay: string[];
  isActive: boolean;
}

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
  marginBottom: "8px",
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

export default function MedicineTrackerPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [timeOfDay, setTimeOfDay] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleTime = (t: string) =>
    setTimeOfDay((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );

  const fetchMedicines = async () => {
    const res = await fetch("/api/medicine");
    const data = await res.json();
    if (data.success) setMedicines(data.data);
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/medicine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, dosage, frequency, timeOfDay, startDate }),
      });
      if (res.ok) {
        setSaved(true);
        setShowForm(false);
        setName("");
        setDosage("");
        setFrequency("");
        setTimeOfDay([]);
        setStartDate("");
        fetchMedicines();
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
        className="px-8 py-5 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
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
            Medicine Tracker
          </h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            backgroundColor: "#C17B7B",
            color: "#FFFFFF",
            padding: "8px 20px",
            borderRadius: "100px",
            fontSize: "0.85rem",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          + Add
        </button>
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
            ✓ Medicine added successfully
          </div>
        )}

        {/* Add form */}
        {showForm && (
          <div style={card}>
            <p style={labelStyle}>Add Medicine</p>
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
                  Medicine name
                </label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Metformin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  Dosage
                </label>
                <input
                  style={inputStyle}
                  placeholder="e.g. 500mg"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
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
                  Frequency
                </label>
                <div className="flex gap-2 flex-wrap mt-1">
                  {frequencyOptions.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFrequency(f)}
                      style={frequency === f ? chipActive : chipInactive}
                    >
                      {f}
                    </button>
                  ))}
                </div>
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
                  Time of day
                </label>
                <div className="flex gap-2 flex-wrap mt-1">
                  {timeOptions.map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleTime(t)}
                      style={timeOfDay.includes(t) ? chipActive : chipInactive}
                    >
                      {t}
                    </button>
                  ))}
                </div>
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
                  Start date
                </label>
                <input
                  type="date"
                  style={inputStyle}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <button
                onClick={handleSave}
                disabled={loading || !name || !dosage}
                style={{
                  width: "100%",
                  backgroundColor:
                    loading || !name || !dosage ? "#EDE0D8" : "#C17B7B",
                  color: loading || !name || !dosage ? "#B09A95" : "#FFFFFF",
                  padding: "14px",
                  borderRadius: "100px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {loading ? "Saving..." : "Save Medicine"}
              </button>
            </div>
          </div>
        )}

        {/* Medicine list */}
        {medicines.length === 0 ? (
          <div style={{ ...card, textAlign: "center", padding: "48px 24px" }}>
            <p style={{ fontSize: "2.5rem", marginBottom: "12px" }}>💊</p>
            <p
              style={{ color: "#8C6B63", fontWeight: 500, marginBottom: "4px" }}
            >
              No medicines added yet
            </p>
            <p style={{ color: "#B09A95", fontSize: "0.85rem" }}>
              Tap + Add to add your first medicine
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p style={labelStyle}>Your Medicines</p>
            {medicines.map((med) => (
              <div key={med.id} style={card}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-playfair)",
                        fontSize: "1.1rem",
                        color: "#2C1810",
                        marginBottom: "4px",
                      }}
                    >
                      {med.name}
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "#8C6B63" }}>
                      {med.dosage} · {med.frequency}
                    </p>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {med.timeOfDay.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: "0.75rem",
                            backgroundColor: "#F5EAE8",
                            color: "#C17B7B",
                            padding: "4px 12px",
                            borderRadius: "100px",
                            fontWeight: 500,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      backgroundColor: "#F5EAE8",
                      color: "#C17B7B",
                      padding: "4px 12px",
                      borderRadius: "100px",
                      fontWeight: 500,
                    }}
                  >
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
