"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const mealTypes = [
  { label: "Breakfast", emoji: "🌅" },
  { label: "Lunch", emoji: "☀️" },
  { label: "Dinner", emoji: "🌆" },
  { label: "Snack", emoji: "🍎" },
];

const pcosTips: Record<string, string> = {
  Breakfast:
    "Start with protein and healthy fats to stabilize blood sugar and reduce insulin spikes.",
  Lunch:
    "Include leafy greens and lean protein. Avoid refined carbs that spike insulin.",
  Dinner:
    "Keep dinner light and anti-inflammatory. Add turmeric or ginger when possible.",
  Snack:
    "Choose low-GI snacks like nuts, seeds, or berries to keep blood sugar stable.",
};

const suggestions: Record<string, string[]> = {
  Breakfast: [
    "🥚 Eggs",
    "🥑 Avocado",
    "🫐 Berries",
    "🥣 Oats",
    "🥜 Almond butter",
    "🍳 Greek yogurt",
  ],
  Lunch: [
    "🐟 Salmon",
    "🥬 Spinach",
    "🍗 Chicken",
    "🫘 Lentils",
    "🥦 Broccoli",
    "🌾 Quinoa",
  ],
  Dinner: [
    "🐟 Tuna",
    "🥦 Broccoli",
    "🍠 Sweet potato",
    "🫚 Olive oil",
    "🧄 Garlic",
    "🌿 Turmeric",
  ],
  Snack: [
    "🌰 Walnuts",
    "🫐 Blueberries",
    "🥜 Almonds",
    "🍎 Apple",
    "🥕 Carrots",
    "🧀 Cheese",
  ],
};

interface DietLog {
  id: string;
  date: string;
  mealType: string;
  foodItems: string[];
  calories?: number;
  notes?: string;
}

export default function DietTrackerPage() {
  const [mealType, setMealType] = useState("");
  const [foodItems, setFoodItems] = useState<string[]>([]);
  const [foodInput, setFoodInput] = useState("");
  const [calories, setCalories] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<DietLog[]>([]);

  useEffect(() => {
    fetch("/api/diet")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setHistory(data.data);
      });
  }, []);

  const addFood = (food: string) => {
    const clean = food.replace(/^[^\w]*/, "").trim();
    if (clean && !foodItems.includes(clean)) {
      setFoodItems((prev) => [...prev, clean]);
      setFoodInput("");
    }
  };

  const removeFood = (food: string) =>
    setFoodItems((prev) => prev.filter((f) => f !== food));

  const handleSave = async () => {
    if (!mealType || foodItems.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/diet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType,
          foodItems,
          calories: calories ? parseInt(calories) : null,
          notes,
          date: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        setMealType("");
        setFoodItems([]);
        setCalories("");
        setNotes("");
        fetch("/api/diet")
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

  const todayLogs = history.filter(
    (h) => new Date(h.date).toDateString() === new Date().toDateString(),
  );

  const totalCalories = todayLogs.reduce(
    (sum, l) => sum + (l.calories || 0),
    0,
  );

  const mealEmojis: Record<string, string> = Object.fromEntries(
    mealTypes.map((m) => [m.label, m.emoji]),
  );

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
          Diet Tracker
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
              ✓ Meal logged!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Today summary */}
        {todayLogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "linear-gradient(135deg, #C17B7B, #D4978A)",
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
              Today's Summary
            </p>
            <div style={{ display: "flex", gap: "20px", marginBottom: "12px" }}>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "2rem",
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {todayLogs.length}
                </div>
                <div style={{ fontSize: "0.72rem", opacity: 0.8 }}>
                  Meals logged
                </div>
              </div>
              {totalCalories > 0 && (
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-playfair)",
                      fontSize: "2rem",
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    {totalCalories}
                  </div>
                  <div style={{ fontSize: "0.72rem", opacity: 0.8 }}>
                    Calories
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {todayLogs.map((log) => (
                <span
                  key={log.id}
                  style={{
                    fontSize: "0.72rem",
                    background: "rgba(255,255,255,0.2)",
                    padding: "4px 10px",
                    borderRadius: "100px",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                >
                  {mealEmojis[log.mealType]} {log.mealType}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Meal type */}
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
              marginBottom: "14px",
            }}
          >
            Meal Type
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "8px",
            }}
          >
            {mealTypes.map((m, i) => (
              <motion.button
                key={m.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMealType(m.label)}
                style={{
                  padding: "14px 6px",
                  borderRadius: "14px",
                  border: "1px solid",
                  borderColor: mealType === m.label ? "#C17B7B" : "#EDE0D8",
                  background: mealType === m.label ? "#F5EAE8" : "#FAF7F5",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <motion.span
                  animate={{ scale: mealType === m.label ? 1.2 : 1 }}
                  style={{ fontSize: "1.4rem" }}
                >
                  {m.emoji}
                </motion.span>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: mealType === m.label ? "#A05C5C" : "#8C6B63",
                    fontWeight: mealType === m.label ? 600 : 400,
                  }}
                >
                  {m.label}
                </span>
              </motion.button>
            ))}
          </div>

          {/* PCOS tip */}
          <AnimatePresence>
            {mealType && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  background: "#F0F8F5",
                  border: "1px solid #8EC4B0",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  marginTop: "12px",
                }}
              >
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#2C7A5A",
                    lineHeight: 1.5,
                  }}
                >
                  💡 <strong>PCOS tip:</strong> {pcosTips[mealType]}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Food items */}
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
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
              Food Items
            </p>
            {foodItems.length > 0 && (
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
                {foodItems.length} items
              </span>
            )}
          </div>

          {/* Input */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <input
              value={foodInput}
              onChange={(e) => setFoodInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addFood(foodInput)}
              placeholder="Type a food item..."
              style={{
                flex: 1,
                border: "1px solid #EDE0D8",
                borderRadius: "12px",
                padding: "10px 14px",
                fontSize: "0.88rem",
                color: "#2C1810",
                background: "#FAF7F5",
                outline: "none",
              }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addFood(foodInput)}
              style={{
                background: "#C17B7B",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                padding: "10px 16px",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Add
            </motion.button>
          </div>

          {/* Food tags */}
          <AnimatePresence>
            {foodItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  marginBottom: "14px",
                }}
              >
                {foodItems.map((food) => (
                  <motion.span
                    key={food}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "#F5EAE8",
                      color: "#A05C5C",
                      borderRadius: "100px",
                      padding: "5px 12px",
                      fontSize: "0.82rem",
                      fontWeight: 500,
                    }}
                  >
                    {food}
                    <button
                      onClick={() => removeFood(food)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#C17B7B",
                        fontSize: "0.9rem",
                        lineHeight: 1,
                        padding: "0 0 0 2px",
                      }}
                    >
                      ×
                    </button>
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Suggestions */}
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
            PCOS-friendly {mealType ? mealType.toLowerCase() : ""} suggestions
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {(suggestions[mealType] ?? suggestions["Snack"] ?? []).map((s) => {
              const clean = s.replace(/^[^\w]*/, "").trim();
              const isAdded = foodItems.includes(clean);
              return (
                <motion.button
                  key={s}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => (isAdded ? removeFood(clean) : addFood(s))}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "100px",
                    border: "1px solid",
                    borderColor: isAdded ? "#C17B7B" : "#EDE0D8",
                    background: isAdded ? "#F5EAE8" : "#fff",
                    fontSize: "0.78rem",
                    color: isAdded ? "#A05C5C" : "#8C6B63",
                    fontWeight: isAdded ? 600 : 400,
                    cursor: "pointer",
                  }}
                >
                  {s}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Calories */}
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
            Calories (optional)
          </p>
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="e.g. 450"
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
            placeholder="How did it taste? How did you feel after?"
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
              height: "72px",
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
          disabled={saving || !mealType || foodItems.length === 0}
          style={{
            width: "100%",
            background:
              saving || !mealType || foodItems.length === 0
                ? "#EDE0D8"
                : "#C17B7B",
            color:
              saving || !mealType || foodItems.length === 0
                ? "#B09A95"
                : "#fff",
            border: "none",
            borderRadius: "100px",
            padding: "16px",
            fontSize: "0.95rem",
            fontWeight: 600,
            cursor:
              saving || !mealType || foodItems.length === 0
                ? "not-allowed"
                : "pointer",
          }}
        >
          {saving ? "Saving..." : "Log Meal 🥗"}
        </motion.button>

        {/* Today's meals */}
        {todayLogs.length > 0 && (
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
                marginBottom: "12px",
              }}
            >
              Today's Meals
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {todayLogs.map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{
                    background: "#FAF7F5",
                    border: "1px solid #EDE0D8",
                    borderRadius: "14px",
                    padding: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
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
                      {mealEmojis[log.mealType]} {log.mealType}
                    </span>
                    {log.calories && (
                      <span style={{ fontSize: "0.72rem", color: "#B09A95" }}>
                        {log.calories} cal
                      </span>
                    )}
                  </div>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}
                  >
                    {log.foodItems.map((food) => (
                      <span
                        key={food}
                        style={{
                          fontSize: "0.75rem",
                          color: "#2C1810",
                          background: "#fff",
                          border: "1px solid #EDE0D8",
                          padding: "3px 10px",
                          borderRadius: "100px",
                        }}
                      >
                        {food}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* History */}
        {history.filter(
          (h) => new Date(h.date).toDateString() !== new Date().toDateString(),
        ).length > 0 && (
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
            {history
              .filter(
                (h) =>
                  new Date(h.date).toDateString() !== new Date().toDateString(),
              )
              .slice(0, 5)
              .map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: i < 4 ? "1px solid #EDE0D8" : "none",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "4px",
                      }}
                    >
                      <span style={{ fontSize: "1rem" }}>
                        {mealEmojis[log.mealType]}
                      </span>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: "#2C1810",
                        }}
                      >
                        {log.mealType}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "#B09A95" }}>
                        ·{" "}
                        {new Date(log.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "#8C6B63" }}>
                      {log.foodItems.slice(0, 3).join(", ")}
                      {log.foodItems.length > 3 ? "..." : ""}
                    </p>
                  </div>
                  {log.calories && (
                    <span
                      style={{
                        fontSize: "0.72rem",
                        background: "#F5EAE8",
                        color: "#C17B7B",
                        padding: "3px 10px",
                        borderRadius: "100px",
                        fontWeight: 600,
                        flexShrink: 0,
                        marginLeft: "8px",
                      }}
                    >
                      {log.calories} cal
                    </span>
                  )}
                </motion.div>
              ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
