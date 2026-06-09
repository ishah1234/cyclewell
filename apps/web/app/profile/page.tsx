"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, useClerk } from "@clerk/nextjs";

const goalOptions = [
  "Manage symptoms",
  "Track cycle",
  "Fertility",
  "Weight management",
  "General wellness",
];
const activityOptions = [
  "Sedentary",
  "Lightly active",
  "Moderate",
  "Very active",
];
const dietOptions = [
  "Vegetarian",
  "Vegan",
  "Non-veg",
  "Gluten-free",
  "No preference",
];

interface ProfileData {
  name: string;
  height: number;
  weight: number;
  dateOfBirth: string;
  cycleLength: string;
  periodLength: string;
  primaryGoal: string;
  activityLevel: string;
  dietaryPref: string;
  diagnosedPCOS: boolean;
}

interface Stats {
  daysLogged: number;
  totalEntries: number;
  streak: number;
}

export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    height: 0,
    weight: 0,
    dateOfBirth: "",
    cycleLength: "30",
    periodLength: "5",
    primaryGoal: "",
    activityLevel: "",
    dietaryPref: "",
    diagnosedPCOS: false,
  });
  const [stats, setStats] = useState<Stats>({
    daysLogged: 0,
    totalEntries: 0,
    streak: 0,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          const p = data.data;
          setProfile({
            name: p.name || "",
            height: p.height || 0,
            weight: p.weight || 0,
            dateOfBirth: p.dateOfBirth
              ? new Date(p.dateOfBirth).toISOString().split("T")[0]
              : "",
            cycleLength: p.cycleLength || "30",
            periodLength: p.periodLength || "5",
            primaryGoal: p.primaryGoal || "",
            activityLevel: p.activityLevel || "",
            dietaryPref: p.dietaryPref || "",
            diagnosedPCOS: p.diagnosedPCOS || false,
          });
        }
      });

    fetch("/api/insights")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStats({
            daysLogged: data.data.stats.uniqueDays,
            totalEntries: data.data.stats.totalEntries,
            streak: data.data.stats.streak,
          });
        }
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          dateOfBirth: profile.dateOfBirth
            ? new Date(profile.dateOfBirth).toISOString()
            : new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const inputStyle = {
    width: "100%",
    border: "1px solid #EDE0D8",
    borderRadius: "12px",
    padding: "11px 14px",
    fontSize: "0.9rem",
    color: "#2C1810",
    background: "#FAF7F5",
    outline: "none",
    boxSizing: "border-box" as const,
    minWidth: 0,
  };

  const labelStyle = {
    fontSize: "0.75rem",
    fontWeight: 600 as const,
    color: "#8C6B63",
    display: "block" as const,
    marginBottom: "6px",
  };

  const cardStyle = {
    background: "#fff",
    border: "1px solid #EDE0D8",
    borderRadius: "20px",
    padding: "20px",
    overflow: "hidden" as const,
    boxSizing: "border-box" as const,
  };

  return (
    <main
      style={{
        backgroundColor: "#FAF7F5",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <style>{`* { box-sizing: border-box; }`}</style>

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
            My Profile
          </h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={saving}
          style={{
            background: "#C17B7B",
            color: "#fff",
            border: "none",
            borderRadius: "100px",
            padding: "8px 18px",
            fontSize: "0.82rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {saving ? "Saving..." : "Save"}
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
          width: "100%",
          boxSizing: "border-box",
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
              ✓ Profile saved!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            ...cardStyle,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "28px 20px",
          }}
        >
          <div style={{ position: "relative", marginBottom: "14px" }}>
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt="Profile"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #F5EAE8",
                }}
              />
            ) : (
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #C17B7B, #D4978A)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  color: "white",
                  fontFamily: "var(--font-playfair)",
                  fontWeight: 700,
                  border: "3px solid #F5EAE8",
                }}
              >
                {initials}
              </div>
            )}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                background: "#C17B7B",
                border: "2px solid #fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                cursor: "pointer",
              }}
            >
              ✏️
            </div>
          </div>
          <p
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#2C1810",
              marginBottom: "2px",
            }}
          >
            {profile.name || user?.fullName || "Your Name"}
          </p>
          <p
            style={{
              fontSize: "0.78rem",
              color: "#B09A95",
              marginBottom: "10px",
            }}
          >
            {user?.primaryEmailAddress?.emailAddress || ""}
          </p>
          <span
            style={{
              background: "#F5EAE8",
              color: "#C17B7B",
              fontSize: "0.72rem",
              fontWeight: 600,
              padding: "4px 14px",
              borderRadius: "100px",
            }}
          >
            🌸 PCOS Warrior
          </span>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4 }}
          style={cardStyle}
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
            Your Journey
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
            }}
          >
            {[
              { val: stats.daysLogged, label: "Days logged" },
              { val: stats.totalEntries, label: "Total entries" },
              { val: `🔥${stats.streak}`, label: "Day streak" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "#FAF7F5",
                  borderRadius: "14px",
                  padding: "14px 8px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "1.4rem",
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

        {/* Personal details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          style={cardStyle}
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
            Personal Details
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div>
              <label style={labelStyle}>Full name</label>
              <input
                value={profile.name}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Your full name"
                style={inputStyle}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                minWidth: 0,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Height (cm)</label>
                <input
                  type="number"
                  value={profile.height || ""}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      height: Number(e.target.value),
                    }))
                  }
                  placeholder="165"
                  style={inputStyle}
                />
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Weight (kg)</label>
                <input
                  type="number"
                  value={profile.weight || ""}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      weight: Number(e.target.value),
                    }))
                  }
                  placeholder="58"
                  style={inputStyle}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Date of birth</label>
              <input
                type="date"
                value={profile.dateOfBirth}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, dateOfBirth: e.target.value }))
                }
                style={inputStyle}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                checked={profile.diagnosedPCOS}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, diagnosedPCOS: e.target.checked }))
                }
                style={{
                  accentColor: "#C17B7B",
                  width: "16px",
                  height: "16px",
                  flexShrink: 0,
                }}
              />
              <label style={{ fontSize: "0.85rem", color: "#2C1810" }}>
                Diagnosed with PCOS
              </label>
            </div>
          </div>
        </motion.div>

        {/* Cycle settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          style={cardStyle}
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
            Cycle Settings
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                minWidth: 0,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Cycle length (days)</label>
                <input
                  type="number"
                  value={profile.cycleLength}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, cycleLength: e.target.value }))
                  }
                  style={inputStyle}
                />
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Period duration (days)</label>
                <input
                  type="number"
                  value={profile.periodLength}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, periodLength: e.target.value }))
                  }
                  style={inputStyle}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Primary goal</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {goalOptions.map((g) => (
                  <motion.button
                    key={g}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setProfile((p) => ({ ...p, primaryGoal: g }))
                    }
                    style={{
                      padding: "6px 12px",
                      borderRadius: "100px",
                      border: "1px solid",
                      borderColor:
                        profile.primaryGoal === g ? "#C17B7B" : "#EDE0D8",
                      background:
                        profile.primaryGoal === g ? "#F5EAE8" : "#fff",
                      fontSize: "0.78rem",
                      color: profile.primaryGoal === g ? "#A05C5C" : "#8C6B63",
                      fontWeight: profile.primaryGoal === g ? 600 : 400,
                      cursor: "pointer",
                    }}
                  >
                    {g}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lifestyle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={cardStyle}
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
            Lifestyle
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            <div>
              <label style={labelStyle}>Activity level</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {activityOptions.map((a) => (
                  <motion.button
                    key={a}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setProfile((p) => ({ ...p, activityLevel: a }))
                    }
                    style={{
                      padding: "6px 12px",
                      borderRadius: "100px",
                      border: "1px solid",
                      borderColor:
                        profile.activityLevel === a ? "#C17B7B" : "#EDE0D8",
                      background:
                        profile.activityLevel === a ? "#F5EAE8" : "#fff",
                      fontSize: "0.78rem",
                      color:
                        profile.activityLevel === a ? "#A05C5C" : "#8C6B63",
                      fontWeight: profile.activityLevel === a ? 600 : 400,
                      cursor: "pointer",
                    }}
                  >
                    {a}
                  </motion.button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Dietary preference</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {dietOptions.map((d) => (
                  <motion.button
                    key={d}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setProfile((p) => ({ ...p, dietaryPref: d }))
                    }
                    style={{
                      padding: "6px 12px",
                      borderRadius: "100px",
                      border: "1px solid",
                      borderColor:
                        profile.dietaryPref === d ? "#C17B7B" : "#EDE0D8",
                      background:
                        profile.dietaryPref === d ? "#F5EAE8" : "#fff",
                      fontSize: "0.78rem",
                      color: profile.dietaryPref === d ? "#A05C5C" : "#8C6B63",
                      fontWeight: profile.dietaryPref === d ? 600 : 400,
                      cursor: "pointer",
                    }}
                  >
                    {d}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          style={cardStyle}
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
            Account
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 0",
              borderBottom: "1px solid #EDE0D8",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.88rem",
                  fontWeight: 500,
                  color: "#2C1810",
                }}
              >
                Export my data
              </p>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "#B09A95",
                  marginTop: "2px",
                }}
              >
                Download all your logs as CSV
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => alert("Export coming soon!")}
              style={{
                background: "#F5EAE8",
                color: "#C17B7B",
                border: "none",
                borderRadius: "100px",
                padding: "7px 14px",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                flexShrink: 0,
                marginLeft: "10px",
              }}
            >
              Export
            </motion.button>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 0",
              borderBottom: "1px solid #EDE0D8",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.88rem",
                  fontWeight: 500,
                  color: "#2C1810",
                }}
              >
                Sign out
              </p>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "#B09A95",
                  marginTop: "2px",
                }}
              >
                Sign out of your account
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => signOut({ redirectUrl: "/sign-in" })}
              style={{
                background: "#F5EAE8",
                color: "#C17B7B",
                border: "none",
                borderRadius: "100px",
                padding: "7px 14px",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                flexShrink: 0,
                marginLeft: "10px",
              }}
            >
              Sign out
            </motion.button>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "14px",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.88rem",
                  fontWeight: 500,
                  color: "#A32D2D",
                }}
              >
                Delete account
              </p>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "#B09A95",
                  marginTop: "2px",
                }}
              >
                Permanently delete all your data
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                confirm("Are you sure? This cannot be undone.") &&
                alert("Please contact support to delete your account.")
              }
              style={{
                background: "#FCEBEB",
                color: "#A32D2D",
                border: "none",
                borderRadius: "100px",
                padding: "7px 14px",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                flexShrink: 0,
                marginLeft: "10px",
              }}
            >
              Delete
            </motion.button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
