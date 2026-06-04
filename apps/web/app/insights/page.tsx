"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const moodEmojis: Record<string, string> = {
  Happy: "😊",
  Calm: "😌",
  Sad: "😢",
  Anxious: "😰",
  Irritable: "😤",
  Energetic: "⚡",
};

const symptomEmojis: Record<string, string> = {
  Cramps: "😣",
  Bloating: "🫧",
  Fatigue: "😴",
  Headache: "🤕",
  Nausea: "🤢",
  "Back pain": "😔",
  "Breast tenderness": "💗",
  "Weight gain": "⚖️",
  Dizziness: "💫",
  Acne: "😤",
  "Hair loss": "💇",
  Insomnia: "🌙",
  "Mood swings": "🎭",
  Anxiety: "😰",
  "Brain fog": "🌫️",
  "Low energy": "⚡",
  Irritability: "😤",
};

const phaseColors: Record<string, string> = {
  Menstrual: "#8B4A4A",
  Follicular: "#C17B7B",
  Ovulatory: "#D4978A",
  Luteal: "#8C6B63",
};

interface InsightData {
  stats: { uniqueDays: number; totalEntries: number; streak: number };
  insights: Array<{ emoji: string; bg: string; text: string; sub: string }>;
  moodPhaseData: Array<{
    phase: string;
    mostCommon: string | null;
    count: number;
  }>;
  topSymptoms: Array<{ symptom: string; count: number }>;
  exerciseByPhase: Record<string, number>;
  avgStress: string;
  adherence: number;
  aiReport: string;
}

export default function InsightsPage() {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/insights")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setData(res.data);
        setLoading(false);
      });
  }, []);

  const maxSymptom = data?.topSymptoms[0]?.count || 1;

  const renderBoldText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <strong key={i} style={{ color: "#2C1810" }}>
          {part}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
  };

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
          My Insights ✨
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
        {loading ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                style={{
                  background: "#EDE0D8",
                  borderRadius: "20px",
                  height: i === 1 ? "120px" : "160px",
                }}
              />
            ))}
            <p
              style={{
                textAlign: "center",
                color: "#B09A95",
                fontSize: "0.85rem",
              }}
            >
              Analyzing your health data...
            </p>
          </div>
        ) : !data ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #EDE0D8",
              borderRadius: "20px",
              padding: "48px 20px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "2.5rem", marginBottom: "12px" }}>📊</p>
            <p
              style={{ color: "#8C6B63", fontWeight: 500, marginBottom: "4px" }}
            >
              Not enough data yet
            </p>
            <p
              style={{
                color: "#B09A95",
                fontSize: "0.82rem",
                marginBottom: "16px",
              }}
            >
              Start logging your mood, symptoms, and exercise to see
              personalized insights
            </p>
            <Link
              href="/dashboard"
              style={{
                background: "#C17B7B",
                color: "#fff",
                padding: "10px 24px",
                borderRadius: "100px",
                fontSize: "0.85rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Start logging →
            </Link>
          </div>
        ) : (
          <>
            {/* Hero stats */}
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
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  marginBottom: "4px",
                }}
              >
                Your health patterns
              </p>
              <p
                style={{
                  fontSize: "0.8rem",
                  opacity: 0.85,
                  marginBottom: "16px",
                }}
              >
                Based on your last 30 days of tracking
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "8px",
                }}
              >
                {[
                  { val: data.stats.uniqueDays, label: "Days logged" },
                  { val: data.stats.totalEntries, label: "Total entries" },
                  { val: `🔥${data.stats.streak}`, label: "Day streak" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      borderRadius: "12px",
                      padding: "10px",
                      textAlign: "center",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-playfair)",
                        fontSize: "1.4rem",
                        fontWeight: 700,
                      }}
                    >
                      {stat.val}
                    </div>
                    <div
                      style={{
                        fontSize: "0.65rem",
                        opacity: 0.8,
                        marginTop: "2px",
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* AI Insights */}
            {data.insights.length > 0 && (
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
                    marginBottom: "4px",
                  }}
                >
                  ✨ Pattern Insights
                </p>
                {data.insights.map((insight, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    style={{
                      display: "flex",
                      gap: "12px",
                      padding: "12px 0",
                      borderBottom:
                        i < data.insights.length - 1
                          ? "1px solid #EDE0D8"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background: insight.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.2rem",
                        flexShrink: 0,
                      }}
                    >
                      {insight.emoji}
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "0.88rem",
                          color: "#8C6B63",
                          lineHeight: 1.5,
                        }}
                      >
                        {renderBoldText(insight.text)}
                      </p>
                      <p
                        style={{
                          fontSize: "0.72rem",
                          color: "#B09A95",
                          marginTop: "2px",
                        }}
                      >
                        {insight.sub}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Mood by phase */}
            {data.moodPhaseData.some((d) => d.count > 0) && (
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
                  Mood by cycle phase
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {data.moodPhaseData.map((d, i) => (
                    <motion.div
                      key={d.phase}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.78rem",
                          color: "#8C6B63",
                          width: "72px",
                          flexShrink: 0,
                        }}
                      >
                        {d.phase}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: "8px",
                          background: "#EDE0D8",
                          borderRadius: "100px",
                          overflow: "hidden",
                        }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width:
                              d.count > 0
                                ? `${Math.min((d.count / 10) * 100, 100)}%`
                                : "0%",
                          }}
                          transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                          style={{
                            height: "100%",
                            borderRadius: "100px",
                            background: phaseColors[d.phase],
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "1rem",
                          width: "24px",
                          textAlign: "center",
                        }}
                      >
                        {d.mostCommon ? moodEmojis[d.mostCommon] || "🌸" : "—"}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Top symptoms */}
            {data.topSymptoms.length > 0 && (
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
                    marginBottom: "4px",
                  }}
                >
                  Top symptoms this month
                </p>
                {data.topSymptoms.map((s, i) => (
                  <motion.div
                    key={s.symptom}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 0",
                      borderBottom:
                        i < data.topSymptoms.length - 1
                          ? "1px solid #EDE0D8"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span style={{ fontSize: "1.1rem" }}>
                        {symptomEmojis[s.symptom] || "📋"}
                      </span>
                      <span
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          color: "#2C1810",
                        }}
                      >
                        {s.symptom}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "80px",
                          height: "4px",
                          background: "#EDE0D8",
                          borderRadius: "100px",
                          overflow: "hidden",
                        }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(s.count / maxSymptom) * 100}%`,
                          }}
                          transition={{ delay: 0.3 + i * 0.06, duration: 0.5 }}
                          style={{
                            height: "100%",
                            borderRadius: "100px",
                            background: "#C17B7B",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          color: "#B09A95",
                          width: "24px",
                        }}
                      >
                        {s.count}x
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Exercise by phase */}
            {Object.values(data.exerciseByPhase).some((v) => v > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
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
                  Exercise by cycle phase
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {Object.entries(data.exerciseByPhase).map(
                    ([phase, mins], i) => {
                      const maxMins = Math.max(
                        ...Object.values(data.exerciseByPhase),
                        1,
                      );
                      return (
                        <motion.div
                          key={phase}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.78rem",
                              color: "#8C6B63",
                              width: "72px",
                              flexShrink: 0,
                            }}
                          >
                            {phase}
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: "8px",
                              background: "#EDE0D8",
                              borderRadius: "100px",
                              overflow: "hidden",
                            }}
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(mins / maxMins) * 100}%` }}
                              transition={{
                                delay: 0.3 + i * 0.08,
                                duration: 0.5,
                              }}
                              style={{
                                height: "100%",
                                borderRadius: "100px",
                                background: phaseColors[phase],
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              color: "#B09A95",
                              width: "40px",
                              textAlign: "right",
                            }}
                          >
                            {mins}m
                          </span>
                        </motion.div>
                      );
                    },
                  )}
                </div>
              </motion.div>
            )}

            {/* AI Monthly Report */}
            {data.aiReport && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                style={{
                  background: "linear-gradient(135deg, #F5EAE8, #FAF7F5)",
                  border: "1px solid #EDE0D8",
                  borderRadius: "20px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "12px",
                  }}
                >
                  <span>✨</span>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      color: "#B09A95",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    AI Monthly Report
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "0.65rem",
                      background: "#fff",
                      color: "#C17B7B",
                      padding: "2px 8px",
                      borderRadius: "100px",
                      border: "1px solid #EDE0D8",
                      fontWeight: 500,
                    }}
                  >
                    Claude
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "0.9rem",
                    color: "#2C1810",
                    fontStyle: "italic",
                    lineHeight: 1.8,
                  }}
                >
                  "{data.aiReport}"
                </p>
              </motion.div>
            )}

            {/* Quick stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #EDE0D8",
                  borderRadius: "18px",
                  padding: "18px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: "#C17B7B",
                  }}
                >
                  {data.avgStress}
                </div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "#B09A95",
                    marginTop: "4px",
                  }}
                >
                  Avg stress level
                </div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "#C17B7B",
                    marginTop: "2px",
                  }}
                >
                  out of 10
                </div>
              </div>
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #EDE0D8",
                  borderRadius: "18px",
                  padding: "18px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: "#C17B7B",
                  }}
                >
                  {Math.min(data.adherence, 100)}%
                </div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "#B09A95",
                    marginTop: "4px",
                  }}
                >
                  Medicine adherence
                </div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: data.adherence >= 80 ? "#2C7A5A" : "#A32D2D",
                    marginTop: "2px",
                  }}
                >
                  {data.adherence >= 80 ? "Great job! 🎉" : "Room to improve"}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </main>
  );
}
