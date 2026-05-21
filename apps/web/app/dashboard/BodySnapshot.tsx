"use client";

import { useState, useEffect } from "react";

export default function BodySnapshot() {
  const [hydration, setHydration] = useState<number>(0);
  const [sleep, setSleep] = useState<number>(0);
  const [energy, setEnergy] = useState<number>(0);
  const [showHydration, setShowHydration] = useState(false);
  const [showSleep, setShowSleep] = useState(false);
  const [showEnergy, setShowEnergy] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/bodylog")
      .then((r) => r.json())
      .then((data) => {
        if (data.data) {
          setHydration(data.data.hydration || 0);
          setSleep(data.data.sleep || 0);
          setEnergy(data.data.energy || 0);
        }
      });
  }, []);

  const save = async (updates: object) => {
    setSaving(true);
    await fetch("/api/bodylog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setSaving(false);
  };

  const card = {
    background: "#fff",
    border: "1px solid #EDE0D8",
    borderRadius: "14px",
    padding: "14px 8px",
    display: "flex" as const,
    flexDirection: "column" as const,
    alignItems: "center" as const,
    gap: "4px",
    cursor: "pointer",
  };

  return (
    <div>
      <span
        style={{
          fontSize: "0.68rem",
          fontWeight: 600,
          color: "#B09A95",
          textTransform: "uppercase" as const,
          letterSpacing: "0.1em",
          display: "block",
          marginBottom: "10px",
        }}
      >
        Today's Body Snapshot
      </span>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8px",
        }}
      >
        {/* Hydration */}
        <div>
          <div
            style={card}
            onClick={() => {
              setShowHydration(!showHydration);
              setShowSleep(false);
              setShowEnergy(false);
            }}
          >
            <span style={{ fontSize: "1.4rem" }}>💧</span>
            <span
              style={{ fontSize: "0.75rem", color: "#2C1810", fontWeight: 500 }}
            >
              Hydration
            </span>
            <span
              style={{
                fontSize: "0.62rem",
                color: hydration > 0 ? "#C17B7B" : "#B09A95",
                fontWeight: hydration > 0 ? 600 : 400,
              }}
            >
              {hydration > 0 ? `${hydration}/8 glasses` : "Tap to log"}
            </span>
          </div>
          {showHydration && (
            <div
              style={{
                background: "#fff",
                border: "1px solid #EDE0D8",
                borderRadius: "14px",
                padding: "14px",
                marginTop: "6px",
              }}
            >
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#7A4F57",
                  marginBottom: "10px",
                  fontWeight: 500,
                }}
              >
                Glasses of water today
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  flexWrap: "wrap" as const,
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      setHydration(n);
                      save({ hydration: n });
                      setShowHydration(false);
                    }}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      border: "1px solid",
                      borderColor: hydration >= n ? "#C17B7B" : "#EDE0D8",
                      background: hydration >= n ? "#F5EAE8" : "#fff",
                      color: hydration >= n ? "#A05C5C" : "#8C6B63",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sleep */}
        <div>
          <div
            style={card}
            onClick={() => {
              setShowSleep(!showSleep);
              setShowHydration(false);
              setShowEnergy(false);
            }}
          >
            <span style={{ fontSize: "1.4rem" }}>😴</span>
            <span
              style={{ fontSize: "0.75rem", color: "#2C1810", fontWeight: 500 }}
            >
              Sleep
            </span>
            <span
              style={{
                fontSize: "0.62rem",
                color: sleep > 0 ? "#C17B7B" : "#B09A95",
                fontWeight: sleep > 0 ? 600 : 400,
              }}
            >
              {sleep > 0 ? `${sleep}h` : "Tap to log"}
            </span>
          </div>
          {showSleep && (
            <div
              style={{
                background: "#fff",
                border: "1px solid #EDE0D8",
                borderRadius: "14px",
                padding: "14px",
                marginTop: "6px",
              }}
            >
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#7A4F57",
                  marginBottom: "10px",
                  fontWeight: 500,
                }}
              >
                Hours of sleep
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  flexWrap: "wrap" as const,
                }}
              >
                {[4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      setSleep(n);
                      save({ sleep: n });
                      setShowSleep(false);
                    }}
                    style={{
                      width: "36px",
                      height: "32px",
                      borderRadius: "8px",
                      border: "1px solid",
                      borderColor: sleep === n ? "#C17B7B" : "#EDE0D8",
                      background: sleep === n ? "#F5EAE8" : "#fff",
                      color: sleep === n ? "#A05C5C" : "#8C6B63",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {n}h
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Energy */}
        <div>
          <div
            style={card}
            onClick={() => {
              setShowEnergy(!showEnergy);
              setShowHydration(false);
              setShowSleep(false);
            }}
          >
            <span style={{ fontSize: "1.4rem" }}>⚡</span>
            <span
              style={{ fontSize: "0.75rem", color: "#2C1810", fontWeight: 500 }}
            >
              Energy
            </span>
            <span
              style={{
                fontSize: "0.62rem",
                color: energy > 0 ? "#C17B7B" : "#B09A95",
                fontWeight: energy > 0 ? 600 : 400,
              }}
            >
              {energy > 0 ? `${energy}/5` : "Tap to log"}
            </span>
          </div>
          {showEnergy && (
            <div
              style={{
                background: "#fff",
                border: "1px solid #EDE0D8",
                borderRadius: "14px",
                padding: "14px",
                marginTop: "6px",
              }}
            >
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#7A4F57",
                  marginBottom: "10px",
                  fontWeight: 500,
                }}
              >
                Energy level today
              </p>
              <div style={{ display: "flex", gap: "6px" }}>
                {[
                  { n: 1, label: "😴" },
                  { n: 2, label: "😔" },
                  { n: 3, label: "😐" },
                  { n: 4, label: "😊" },
                  { n: 5, label: "⚡" },
                ].map(({ n, label }) => (
                  <button
                    key={n}
                    onClick={() => {
                      setEnergy(n);
                      save({ energy: n });
                      setShowEnergy(false);
                    }}
                    style={{
                      flex: 1,
                      padding: "8px 4px",
                      borderRadius: "10px",
                      border: "1px solid",
                      borderColor: energy === n ? "#C17B7B" : "#EDE0D8",
                      background: energy === n ? "#F5EAE8" : "#fff",
                      fontSize: "1.1rem",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column" as const,
                      alignItems: "center",
                      gap: "2px",
                    }}
                  >
                    {label}
                    <span style={{ fontSize: "0.6rem", color: "#B09A95" }}>
                      {n}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {saving && (
        <p
          style={{
            fontSize: "0.7rem",
            color: "#C17B7B",
            textAlign: "center",
            marginTop: "8px",
          }}
        >
          Saving...
        </p>
      )}
    </div>
  );
}
