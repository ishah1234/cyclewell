import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import Anthropic from "@anthropic-ai/sdk";
import BodySnapshot from "./BodySnapshot";

const prisma = new PrismaClient();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function getAITip(cyclePhase: string, name: string) {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 120,
      messages: [
        {
          role: "user",
          content: `Give a single warm, specific wellness tip for someone with PCOS in their ${cyclePhase} phase. Address them as ${name}. Max 2 sentences. No emojis. Warm and personal tone.`,
        },
      ],
    });
    return message.content[0].type === "text" ? message.content[0].text : "";
  } catch (error) {
    console.error("Claude API error:", error);
    return "Take a moment today to check in with your body and honor what it needs.";
  }
}

const cycleTips: Record<string, string> = {
  Menstrual:
    "Rest is productive during your period. Gentle heat, magnesium-rich foods, and slow movement can ease discomfort significantly.",
  Follicular:
    "Your rising estrogen makes this a great time to try new workouts or start a new habit — your body is primed to adapt.",
  Ovulatory:
    "Peak communication skills and confidence happen now. Great time for important conversations or presentations.",
  Luteal:
    "Cravings for complex carbs are natural now — reach for sweet potato, oats, or lentils to satisfy them nutritiously.",
  Unknown:
    "Logging your period helps CycleWell give you personalized phase-based tips every day.",
};

function getCycleInfo(lastPeriodDate: Date | null, cycleLength: number) {
  if (!lastPeriodDate)
    return {
      phase: "Unknown",
      day: 0,
      emoji: "🌙",
      description: "Log your period to start tracking",
      daysToPeriod: null,
      daysToOvulation: null,
      confidence: 0,
      gradient: "linear-gradient(135deg, #C17B7B 0%, #D4978A 100%)",
      nextPeriodDate: null,
      nextOvulationDate: null,
    };

  const today = new Date();
  const daysSince = Math.floor(
    (today.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const cycleDay = (daysSince % cycleLength) + 1;
  const ovulationDay = Math.round(cycleLength * 0.45);
  const daysToOvulation = ovulationDay - cycleDay;
  const daysToPeriod = cycleLength - cycleDay;
  const nextPeriodDate = new Date(
    lastPeriodDate.getTime() + cycleLength * 24 * 60 * 60 * 1000,
  );
  const nextOvulationDate =
    daysToOvulation > 0
      ? new Date(today.getTime() + daysToOvulation * 24 * 60 * 60 * 1000)
      : null;

  let phase, emoji, description, gradient;
  if (cycleDay <= 5) {
    phase = "Menstrual";
    emoji = "🌑";
    description = "Rest and be gentle with yourself";
    gradient = "linear-gradient(135deg, #8B4A4A 0%, #C17B7B 100%)";
  } else if (cycleDay <= 13) {
    phase = "Follicular";
    emoji = "🌒";
    description = "Energy is rising — great time to start new things";
    gradient = "linear-gradient(135deg, #C17B7B 0%, #D4978A 100%)";
  } else if (cycleDay <= 16) {
    phase = "Ovulatory";
    emoji = "🌕";
    description = "Peak energy and confidence";
    gradient = "linear-gradient(135deg, #D4978A 0%, #E8B89A 100%)";
  } else {
    phase = "Luteal";
    emoji = "🌖";
    description = "Wind down and practice self care";
    gradient = "linear-gradient(135deg, #8C6B63 0%, #C17B7B 100%)";
  }

  return {
    phase,
    day: cycleDay,
    emoji,
    description,
    gradient,
    daysToPeriod,
    daysToOvulation: daysToOvulation > 0 ? daysToOvulation : null,
    confidence: 85,
    nextPeriodDate,
    nextOvulationDate,
  };
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      profile: true,
      cycleLogs: { orderBy: { startDate: "desc" }, take: 3 },
      moodLogs: { orderBy: { date: "desc" }, take: 7 },
      symptoms: { orderBy: { date: "desc" }, take: 5 },
      medicineLogs: { orderBy: { date: "desc" }, take: 5 },
    },
  });

  if (!user?.profile) redirect("/onboarding");

  const name = user.profile.name.split(" ")[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const lastPeriod = user.cycleLogs[0]?.startDate || null;
  const cycleLength = 30;
  const cycleInfo = getCycleInfo(lastPeriod, cycleLength);
  const aiTip = await getAITip(cycleInfo.phase, name);
  const cycleTip = cycleTips[cycleInfo.phase];

  const todayStr = new Date().toDateString();
  const yesterdayStr = new Date(Date.now() - 86400000).toDateString();
  const recentMoodDates = user.moodLogs.map((m) =>
    new Date(m.date).toDateString(),
  );
  const loggedToday = recentMoodDates.includes(todayStr);
  const loggedYesterday = recentMoodDates.includes(yesterdayStr);
  const streak = loggedToday ? (loggedYesterday ? 2 : 1) : 0;

  const todayLogs = {
    mood: recentMoodDates.includes(todayStr),
    period: user.cycleLogs[0]
      ? new Date(user.cycleLogs[0].startDate).toDateString() === todayStr
      : false,
    medicine: user.medicineLogs[0]
      ? new Date(user.medicineLogs[0].date).toDateString() === todayStr
      : false,
  };

  const quickLogs = [
    {
      label: "Period",
      emoji: "🩸",
      href: "/tracker/period",
      done: todayLogs.period,
    },
    { label: "Mood", emoji: "🌸", href: "/tracker/mood", done: todayLogs.mood },
    {
      label: "Medicine",
      emoji: "💊",
      href: "/tracker/medicine",
      done: todayLogs.medicine,
    },
    { label: "Symptoms", emoji: "📋", href: "/tracker/symptoms", done: false },
    { label: "Exercise", emoji: "🏃", href: "/tracker/exercise", done: false },
    { label: "Diet", emoji: "🥗", href: "/tracker/diet", done: false },
    { label: "Hormones", emoji: "🔬", href: "/tracker/hormone", done: false },
  ];

  const doneCount = quickLogs.filter((q) => q.done).length;
  const dashArray = (cycleInfo.day / cycleLength) * 201;

  return (
    <main style={{ backgroundColor: "#FAF7F5", minHeight: "100vh" }}>
      <nav
        style={{
          backgroundColor: "#fff",
          borderBottom: "1px solid #EDE0D8",
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-playfair)",
            color: "#C17B7B",
            fontSize: "1.2rem",
            fontWeight: 600,
          }}
        >
          CycleWell
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {streak > 0 && (
            <span
              style={{
                background: "#F5EAE8",
                padding: "4px 10px",
                borderRadius: "100px",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#A05C5C",
              }}
            >
              🔥 {streak} day streak
            </span>
          )}
          <Link
            href="/sign-in"
            style={{ fontSize: "0.78rem", color: "#B09A95" }}
          >
            Sign out
          </Link>
        </div>
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
        <div>
          <p
            style={{
              fontSize: "0.78rem",
              color: "#B09A95",
              marginBottom: "2px",
            }}
          >
            {greeting} ·{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h2
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "1.9rem",
              fontWeight: 700,
              color: "#2C1810",
            }}
          >
            {name} 🌸
          </h2>
        </div>

        {/* Hero cycle card */}
        <div
          style={{
            background: cycleInfo.gradient,
            borderRadius: "22px",
            padding: "22px",
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-25px",
              right: "-25px",
              width: "130px",
              height: "130px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.07)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-40px",
              left: "20px",
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.04)",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              position: "relative",
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  opacity: 0.85,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "6px",
                }}
              >
                {cycleInfo.emoji} {cycleInfo.phase} Phase
              </div>
              {cycleInfo.day > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "6px",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "3.2rem",
                      fontWeight: 700,
                      fontFamily: "var(--font-playfair)",
                      lineHeight: 1,
                    }}
                  >
                    {cycleInfo.day}
                  </span>
                  <span style={{ fontSize: "0.9rem", opacity: 0.7 }}>
                    / {cycleLength}
                  </span>
                </div>
              )}
              <p
                style={{
                  fontSize: "0.8rem",
                  opacity: 0.82,
                  lineHeight: 1.4,
                  maxWidth: "200px",
                }}
              >
                {cycleInfo.description}
              </p>
            </div>

            <svg
              width="85"
              height="85"
              viewBox="0 0 85 85"
              style={{ flexShrink: 0 }}
            >
              <circle
                cx="42.5"
                cy="42.5"
                r="34"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="6"
              />
              <circle
                cx="42.5"
                cy="42.5"
                r="34"
                fill="none"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="6"
                strokeDasharray={`${dashArray} 214`}
                strokeLinecap="round"
                transform="rotate(-90 42.5 42.5)"
              />
              <text
                x="42.5"
                y="39"
                textAnchor="middle"
                fill="white"
                fontSize="9"
                fontWeight="600"
              >
                DAY
              </text>
              <text
                x="42.5"
                y="54"
                textAnchor="middle"
                fill="white"
                fontSize="16"
                fontWeight="700"
              >
                {cycleInfo.day || "?"}
              </text>
            </svg>
          </div>

          {cycleInfo.daysToPeriod !== null && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                marginTop: "14px",
                position: "relative",
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "14px",
                  padding: "10px 14px",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-playfair)",
                  }}
                >
                  {cycleInfo.daysToPeriod}
                </div>
                <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>
                  Days to period
                </div>
                {cycleInfo.nextPeriodDate && (
                  <div style={{ fontSize: "0.65rem", opacity: 0.6 }}>
                    {cycleInfo.nextPeriodDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                )}
              </div>
              {cycleInfo.daysToOvulation && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: "14px",
                    padding: "10px 14px",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      fontFamily: "var(--font-playfair)",
                    }}
                  >
                    {cycleInfo.daysToOvulation}
                  </div>
                  <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>
                    Days to ovulation
                  </div>
                  {cycleInfo.nextOvulationDate && (
                    <div style={{ fontSize: "0.65rem", opacity: 0.6 }}>
                      {cycleInfo.nextOvulationDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <p
            style={{
              fontSize: "0.65rem",
              opacity: 0.6,
              marginTop: "10px",
              position: "relative",
            }}
          >
            {cycleLength}-day cycle · {cycleInfo.confidence}% confidence
          </p>

          <Link
            href="/tracker/period"
            style={{
              display: "inline-block",
              marginTop: "12px",
              background: "rgba(255,255,255,0.2)",
              color: "white",
              padding: "8px 18px",
              borderRadius: "100px",
              fontSize: "0.78rem",
              fontWeight: 600,
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.3)",
              position: "relative",
            }}
          >
            {lastPeriod ? "Update period →" : "Log period →"}
          </Link>
        </div>

        {/* Quick log */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 600,
                color: "#B09A95",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Quick Log
            </span>
            <span
              style={{ fontSize: "0.72rem", color: "#C17B7B", fontWeight: 500 }}
            >
              {doneCount}/{quickLogs.length} today
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "8px",
            }}
          >
            {quickLogs.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  background: item.done ? "#F5EAE8" : "#fff",
                  border: item.done ? "1px solid #C17B7B" : "1px solid #EDE0D8",
                  borderRadius: "14px",
                  padding: "12px 4px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "5px",
                  textDecoration: "none",
                  position: "relative",
                }}
              >
                {item.done && (
                  <div
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      width: "13px",
                      height: "13px",
                      borderRadius: "50%",
                      background: "#C17B7B",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        color: "white",
                        fontSize: "7px",
                        fontWeight: 700,
                      }}
                    >
                      ✓
                    </span>
                  </div>
                )}
                <span style={{ fontSize: "1.3rem" }}>{item.emoji}</span>
                <span
                  style={{
                    fontSize: "0.65rem",
                    color: item.done ? "#A05C5C" : "#8C6B63",
                    fontWeight: item.done ? 600 : 400,
                  }}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Body snapshot */}
        <BodySnapshot />

        {/* AI Insight */}
        <div
          style={{
            background: "linear-gradient(135deg, #F5EAE8, #FAF7F5)",
            border: "1px solid #EDE0D8",
            borderRadius: "18px",
            padding: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "10px",
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
              Your daily insight
            </span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: "0.65rem",
                background: "#fff",
                color: "#C17B7B",
                padding: "3px 8px",
                borderRadius: "100px",
                fontWeight: 500,
                border: "1px solid #EDE0D8",
              }}
            >
              AI · {cycleInfo.phase}
            </span>
          </div>
          <p
            style={{
              fontSize: "0.88rem",
              color: "#2C1810",
              lineHeight: 1.7,
              fontStyle: "italic",
              fontFamily: "var(--font-playfair)",
            }}
          >
            "{aiTip}"
          </p>
        </div>

        {/* Recent moods */}
        {user.moodLogs.length > 0 && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #EDE0D8",
              borderRadius: "18px",
              padding: "18px",
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
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  color: "#B09A95",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Recent Moods
              </span>
              <Link
                href="/tracker/mood"
                style={{ fontSize: "0.75rem", color: "#C17B7B" }}
              >
                Log today →
              </Link>
            </div>
            <div style={{ display: "flex", gap: "16px" }}>
              {user.moodLogs.slice(0, 7).map((log, i) => {
                const moodEmojis: Record<string, string> = {
                  Happy: "😊",
                  Calm: "😌",
                  Sad: "😢",
                  Anxious: "😰",
                  Irritable: "😤",
                  Energetic: "⚡",
                };
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span style={{ fontSize: "1.3rem" }}>
                      {moodEmojis[log.mood] || "🌸"}
                    </span>
                    <span style={{ fontSize: "0.62rem", color: "#B09A95" }}>
                      {new Date(log.date).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cycle tip */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #EDE0D8",
            borderRadius: "18px",
            padding: "18px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "12px",
              background: "#F5EAE8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: "1.2rem",
            }}
          >
            🌿
          </div>
          <div>
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 600,
                color: "#C17B7B",
                background: "#F5EAE8",
                padding: "2px 8px",
                borderRadius: "100px",
                display: "inline-block",
                marginBottom: "6px",
              }}
            >
              {cycleInfo.phase.toLowerCase()}
            </span>
            <p
              style={{
                fontSize: "0.82rem",
                color: "#8C6B63",
                lineHeight: 1.55,
              }}
            >
              {cycleTip}
            </p>
          </div>
        </div>

        {/* Profile */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #EDE0D8",
            borderRadius: "18px",
            padding: "18px",
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
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 600,
                color: "#B09A95",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Your Profile
            </span>
            <Link
              href="/onboarding"
              style={{ fontSize: "0.75rem", color: "#C17B7B" }}
            >
              Edit →
            </Link>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
            }}
          >
            {[
              { label: "Goal", value: user.profile.primaryGoal },
              { label: "Activity", value: user.profile.activityLevel },
              { label: "Diet", value: user.profile.dietaryPref },
              { label: "Cycle length", value: user.profile.cycleLength },
            ].map((item) => (
              <div key={item.label}>
                <p
                  style={{
                    fontSize: "0.68rem",
                    color: "#B09A95",
                    marginBottom: "2px",
                  }}
                >
                  {item.label}
                </p>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#2C1810",
                    fontWeight: 500,
                  }}
                >
                  {item.value || "Not set"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
