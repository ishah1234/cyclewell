"use client";

import { useState } from "react";
import Link from "next/link";

const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"];
const suggestedFoods = [
  "Oats",
  "Berries",
  "Spinach",
  "Salmon",
  "Quinoa",
  "Avocado",
  "Eggs",
  "Greek yogurt",
  "Almonds",
  "Broccoli",
  "Sweet potato",
  "Lentils",
  "Turmeric",
  "Ginger",
  "Flaxseeds",
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

export default function DietTrackerPage() {
  const [mealType, setMealType] = useState("");
  const [foodItems, setFoodItems] = useState<string[]>([]);
  const [foodInput, setFoodInput] = useState("");
  const [calories, setCalories] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const addFood = () => {
    if (foodInput.trim() && !foodItems.includes(foodInput.trim())) {
      setFoodItems((prev) => [...prev, foodInput.trim()]);
      setFoodInput("");
    }
  };

  const removeFood = (food: string) =>
    setFoodItems((prev) => prev.filter((f) => f !== food));

  const addSuggested = (food: string) => {
    if (!foodItems.includes(food)) {
      setFoodItems((prev) => [...prev, food]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
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
        setMealType("");
        setFoodItems([]);
        setCalories("");
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
          Diet Tracker
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
            ✓ Meal logged successfully
          </div>
        )}

        {/* Meal type */}
        <div style={card}>
          <p style={labelStyle}>Meal Type</p>
          <div className="flex gap-2 flex-wrap">
            {mealTypes.map((m) => (
              <button
                key={m}
                onClick={() => setMealType(m)}
                style={mealType === m ? chipActive : chipInactive}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Food items */}
        <div style={card}>
          <p style={labelStyle}>Food Items</p>

          {/* Input */}
          <div className="flex gap-2 mb-4">
            <input
              style={{
                flex: 1,
                border: "1px solid #EDE0D8",
                borderRadius: "12px",
                padding: "12px 16px",
                fontSize: "0.9rem",
                color: "#2C1810",
                backgroundColor: "#FFFFFF",
                outline: "none",
              }}
              placeholder="Type a food item..."
              value={foodInput}
              onChange={(e) => setFoodInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addFood()}
            />
            <button
              onClick={addFood}
              style={{
                backgroundColor: "#C17B7B",
                color: "#FFFFFF",
                padding: "12px 20px",
                borderRadius: "12px",
                fontSize: "0.85rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              Add
            </button>
          </div>

          {/* Added foods */}
          {foodItems.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {foodItems.map((food) => (
                <span
                  key={food}
                  style={{
                    backgroundColor: "#F5EAE8",
                    color: "#A05C5C",
                    padding: "6px 14px",
                    borderRadius: "100px",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {food}
                  <button
                    onClick={() => removeFood(food)}
                    style={{
                      color: "#C17B7B",
                      fontWeight: 700,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Suggestions */}
          <p style={{ ...labelStyle, marginBottom: "8px" }}>
            PCOS-friendly suggestions
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedFoods.map((food) => (
              <button
                key={food}
                onClick={() => addSuggested(food)}
                style={foodItems.includes(food) ? chipActive : chipInactive}
              >
                {food}
              </button>
            ))}
          </div>
        </div>

        {/* Calories */}
        <div style={card}>
          <p style={labelStyle}>Calories (optional)</p>
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
            placeholder="e.g. 450"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
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
            placeholder="Any notes about this meal..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={loading || !mealType || foodItems.length === 0}
          style={{
            width: "100%",
            backgroundColor:
              loading || !mealType || foodItems.length === 0
                ? "#EDE0D8"
                : "#C17B7B",
            color:
              loading || !mealType || foodItems.length === 0
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
          {loading ? "Saving..." : "Log Meal"}
        </button>
      </div>
    </main>
  );
}
