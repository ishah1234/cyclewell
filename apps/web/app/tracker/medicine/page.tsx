"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const frequencyOptions = ["Daily", "Twice daily", "Weekly", "As needed"];
const timeOptions = ["Morning", "Afternoon", "Evening", "Night"];

const timeMap: Record<string, string> = {
  Morning: "08:00",
  Afternoon: "13:00",
  Evening: "19:00",
  Night: "21:00",
};

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay: string[];
  isActive: boolean;
  createdAt: string;
}

interface MedicineLog {
  id: string;
  medicineId: string;
  date: string;
  taken: boolean;
}

export default function MedicineTrackerPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [logs, setLogs] = useState<MedicineLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [timeOfDay, setTimeOfDay] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notifPermission, setNotifPermission] = useState<string>("default");
  const [markingId, setMarkingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMedicines();
    if ("Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const fetchMedicines = async () => {
    const res = await fetch("/api/medicine");
    const data = await res.json();
    if (data.success) setMedicines(data.data);
  };

  const requestNotifications = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
  };

  const scheduleReminder = (medName: string, times: string[]) => {
    if (notifPermission !== "granted") return;
    times.forEach((time) => {
      const [hour, minute] = timeMap[time]?.split(":").map(Number) || [8, 0];
      const now = new Date();
      const reminder = new Date();
      reminder.setHours(hour, minute, 0, 0);
      if (reminder <= now) reminder.setDate(reminder.getDate() + 1);
      const delay = reminder.getTime() - now.getTime();
      setTimeout(() => {
        new Notification("💊 Medicine Reminder", {
          body: `Time to take your ${medName}!`,
          icon: "/favicon.ico",
        });
      }, delay);
    });
  };

  const toggleTime = (t: string) =>
    setTimeOfDay((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/medicine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          dosage,
          frequency,
          timeOfDay,
          startDate: startDate || new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        scheduleReminder(name, timeOfDay);
        setShowForm(false);
        setName("");
        setDosage("");
        setFrequency("");
        setTimeOfDay("" as unknown as string[]);
        setStartDate("");
        fetchMedicines();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const markTaken = async (medicineId: string, taken: boolean) => {
    setMarkingId(medicineId);
    try {
      await fetch("/api/medicine/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicineId,
          taken,
          date: new Date().toISOString(),
        }),
      });
      fetchMedicines();
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingId(null);
    }
  };

  // Group medicines by time of day
  const groupedMedicines = timeOptions.reduce(
    (acc, time) => {
      const meds = medicines.filter((m) => m.timeOfDay?.includes(time));
      if (meds.length > 0) acc[time] = meds;
      return acc;
    },
    {} as Record<string, Medicine[]>,
  );

  // Get today's taken count
  const todayStr = new Date().toDateString();
  const takenToday = logs.filter(
    (l) => new Date(l.date).toDateString() === todayStr && l.taken,
  ).length;

  // 7 day streak helper
  const getLast7Days = () =>
    Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        label:
          i === 6
            ? "Today"
            : date.toLocaleDateString("en-US", { weekday: "short" }),
        isToday: i === 6,
      };
    });

  const medicineEmojis = ["💊", "🌿", "🔆", "💉", "🧴", "🫧", "🍵", "💙"];

  return (
    <main style={{ backgroundColor: "#FAF7F5", minHeight: "100vh" }}>
      <nav
        style={{
          backgroundColor: "#fff",
          borderBottom: "1px solid #EDE0D8",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          style={{
            background: "#C17B7B",
            color: "#fff",
            border: "none",
            borderRadius: "100px",
            padding: "8px 16px",
            fontSize: "0.82rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {showForm ? "✕ Cancel" : "+ Add"}
        </motion.button>
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
        {/* Notification banner */}
        {notifPermission !== "granted" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "linear-gradient(135deg, #F5EAE8, #FAF7F5)",
              border: "1px solid #EDE0D8",
              borderRadius: "16px",
              padding: "14px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#2C1810",
                  marginBottom: "2px",
                }}
              >
                Enable reminders 🔔
              </p>
              <p style={{ fontSize: "0.75rem", color: "#B09A95" }}>
                Get notified when it's time to take your medicine
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={requestNotifications}
              style={{
                background: "#C17B7B",
                color: "#fff",
                border: "none",
                borderRadius: "100px",
                padding: "8px 14px",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                flexShrink: 0,
                marginLeft: "12px",
              }}
            >
              Enable
            </motion.button>
          </motion.div>
        )}

        {notifPermission === "granted" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: "#F0F8F5",
              border: "1px solid #8EC4B0",
              borderRadius: "16px",
              padding: "12px 16px",
            }}
          >
            <p
              style={{ fontSize: "0.82rem", color: "#2C7A5A", fontWeight: 500 }}
            >
              ✓ Reminders enabled — you'll be notified at your scheduled times
            </p>
          </motion.div>
        )}

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
              ✓ Medicine added! Reminder scheduled.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              style={{
                background: "#fff",
                border: "1px solid #EDE0D8",
                borderRadius: "20px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
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
                Add Medicine
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Medicine name (e.g. Metformin)"
                  style={{
                    width: "100%",
                    border: "1px solid #EDE0D8",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    fontSize: "0.88rem",
                    color: "#2C1810",
                    background: "#FAF7F5",
                    outline: "none",
                  }}
                />
                <input
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="Dosage (e.g. 500mg)"
                  style={{
                    width: "100%",
                    border: "1px solid #EDE0D8",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    fontSize: "0.88rem",
                    color: "#2C1810",
                    background: "#FAF7F5",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <p
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    color: "#B09A95",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "8px",
                  }}
                >
                  Frequency
                </p>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {frequencyOptions.map((f) => (
                    <motion.button
                      key={f}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFrequency(f)}
                      style={{
                        padding: "7px 14px",
                        borderRadius: "100px",
                        border: "1px solid",
                        borderColor: frequency === f ? "#C17B7B" : "#EDE0D8",
                        background: frequency === f ? "#F5EAE8" : "#fff",
                        color: frequency === f ? "#A05C5C" : "#8C6B63",
                        fontSize: "0.8rem",
                        fontWeight: frequency === f ? 600 : 400,
                        cursor: "pointer",
                      }}
                    >
                      {f}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <p
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    color: "#B09A95",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "8px",
                  }}
                >
                  Time of day{" "}
                  {notifPermission === "granted" && (
                    <span style={{ color: "#C17B7B" }}>
                      · reminders set automatically
                    </span>
                  )}
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "6px",
                  }}
                >
                  {timeOptions.map((t) => (
                    <motion.button
                      key={t}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleTime(t)}
                      style={{
                        padding: "10px 4px",
                        borderRadius: "12px",
                        border: "1px solid",
                        borderColor: timeOfDay.includes(t)
                          ? "#C17B7B"
                          : "#EDE0D8",
                        background: timeOfDay.includes(t)
                          ? "#F5EAE8"
                          : "#FAF7F5",
                        color: timeOfDay.includes(t) ? "#A05C5C" : "#8C6B63",
                        fontSize: "0.75rem",
                        fontWeight: timeOfDay.includes(t) ? 600 : 400,
                        cursor: "pointer",
                      }}
                    >
                      {t === "Morning"
                        ? "🌅"
                        : t === "Afternoon"
                          ? "☀️"
                          : t === "Evening"
                            ? "🌆"
                            : "🌙"}
                      <br />
                      <span style={{ fontSize: "0.65rem" }}>{timeMap[t]}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving || !name || !dosage}
                style={{
                  width: "100%",
                  background:
                    saving || !name || !dosage ? "#EDE0D8" : "#C17B7B",
                  color: saving || !name || !dosage ? "#B09A95" : "#fff",
                  border: "none",
                  borderRadius: "100px",
                  padding: "14px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {saving ? "Saving..." : "💊 Save Medicine"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Today's schedule */}
        {medicines.length > 0 && (
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
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
                Today's Schedule
              </p>
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
                {medicines.length} medicines
              </span>
            </div>

            {Object.entries(groupedMedicines).map(([time, meds]) => (
              <div key={time} style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#C17B7B",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: "#C17B7B",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {time === "Morning"
                      ? "🌅"
                      : time === "Afternoon"
                        ? "☀️"
                        : time === "Evening"
                          ? "🌆"
                          : "🌙"}{" "}
                    {time} · {timeMap[time]}
                  </span>
                </div>
                {meds.map((med, i) => (
                  <motion.div
                    key={med.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 0",
                      borderBottom:
                        i < meds.length - 1 ? "1px solid #EDE0D8" : "none",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "12px",
                        background: "#F5EAE8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.2rem",
                        flexShrink: 0,
                      }}
                    >
                      {medicineEmojis[i % medicineEmojis.length]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          color: "#2C1810",
                        }}
                      >
                        {med.name}
                      </p>
                      <p
                        style={{
                          fontSize: "0.72rem",
                          color: "#B09A95",
                          marginTop: "2px",
                        }}
                      >
                        {med.dosage} · {med.frequency}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => markTaken(med.id, true)}
                      disabled={markingId === med.id}
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "50%",
                        border: "2px solid",
                        borderColor: "#EDE0D8",
                        background: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        flexShrink: 0,
                      }}
                    >
                      {markingId === med.id ? "..." : "○"}
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            ))}
          </motion.div>
        )}

        {/* Streak tracker */}
        {medicines.slice(0, 3).map((med, medIndex) => (
          <motion.div
            key={med.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: medIndex * 0.08 }}
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
                {med.name} · Streak
              </p>
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
                🔥 Keep going!
              </span>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {getLast7Days().map((day, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.04, type: "spring" }}
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      background: day.isToday
                        ? "#F5EAE8"
                        : i < 6
                          ? "#C17B7B"
                          : "#EDE0D8",
                      border: day.isToday ? "2px solid #C17B7B" : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      color: day.isToday
                        ? "#C17B7B"
                        : i < 6
                          ? "white"
                          : "#B09A95",
                      fontWeight: 600,
                    }}
                  >
                    {day.isToday ? "!" : "✓"}
                  </motion.div>
                  <span
                    style={{
                      fontSize: "0.55rem",
                      color: day.isToday ? "#C17B7B" : "#B09A95",
                      fontWeight: day.isToday ? 600 : 400,
                    }}
                  >
                    {day.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Empty state */}
        {medicines.length === 0 && !showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: "#fff",
              border: "1px solid #EDE0D8",
              borderRadius: "20px",
              padding: "48px 20px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "2.5rem", marginBottom: "12px" }}>💊</p>
            <p
              style={{ color: "#8C6B63", fontWeight: 500, marginBottom: "4px" }}
            >
              No medicines added yet
            </p>
            <p
              style={{
                color: "#B09A95",
                fontSize: "0.82rem",
                marginBottom: "16px",
              }}
            >
              Add your medications to get daily reminders
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              style={{
                background: "#C17B7B",
                color: "#fff",
                border: "none",
                borderRadius: "100px",
                padding: "12px 24px",
                fontSize: "0.88rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              + Add your first medicine
            </motion.button>
          </motion.div>
        )}
      </div>
    </main>
  );
}
