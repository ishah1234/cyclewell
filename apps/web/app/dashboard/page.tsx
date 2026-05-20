import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import Anthropic from "@anthropic-ai/sdk";

const prisma = new PrismaClient();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function getAITip(cyclePhase: string, name: string) {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 100,
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

function getCyclePhase(
  lastPeriodDate: Date | null,
  cycleLength: number,
): {
  phase: string;
  day: number;
  emoji: string;
  color: string;
  description: string;
} {
  if (!lastPeriodDate)
    return {
      phase: "Unknown",
      day: 0,
      emoji: "🌙",
      color: "#C17B7B",
      description: "Log your period to start tracking",
    };

  const today = new Date();
  const daysSince = Math.floor(
    (today.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const cycleDay = (daysSince % cycleLength) + 1;

  if (cycleDay <= 5)
    return {
      phase: "Menstrual",
      day: cycleDay,
      emoji: "🌑",
      color: "#A05C5C",
      description: "Rest and be gentle with yourself",
    };
  if (cycleDay <= 13)
    return {
      phase: "Follicular",
      day: cycleDay,
      emoji: "🌒",
      color: "#C17B7B",
      description: "Energy is rising — great time to start new things",
    };
  if (cycleDay <= 16)
    return {
      phase: "Ovulatory",
      day: cycleDay,
      emoji: "🌕",
      color: "#D4978A",
      description: "Peak energy and confidence",
    };
  return {
    phase: "Luteal",
    day: cycleDay,
    emoji: "🌖",
    color: "#8C6B63",
    description: "Wind down and practice self care",
  };
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      profile: true,
      cycleLogs: { orderBy: { startDate: "desc" }, take: 1 },
      moodLogs: { orderBy: { date: "desc" }, take: 7 },
      symptoms: { orderBy: { date: "desc" }, take: 5 },
    },
  });

  if (!user?.profile) redirect("/onboarding");

  const name = user.profile.name.split(" ")[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const lastPeriod = user.cycleLogs[0]?.startDate || null;
  const cycleLength = 30;
  const cycleInfo = getCyclePhase(lastPeriod, cycleLength);

  const aiTip = await getAITip(cycleInfo.phase, name);

  // Streak calculation
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const recentMoods = user.moodLogs.map((m) => new Date(m.date).toDateString());
  const loggedToday = recentMoods.includes(today);
  const loggedYesterday = recentMoods.includes(yesterday);
  const streak = loggedToday ? (loggedYesterday ? 2 : 1) : 0;

  const quickLogs = [
    { label: "Period", emoji: "🩸", href: "/tracker/period" },
    { label: "Mood", emoji: "🌸", href: "/tracker/mood" },
    { label: "Medicine", emoji: "💊", href: "/tracker/medicine" },
    { label: "Symptoms", emoji: "📋", href: "/tracker/symptoms" },
    { label: "Exercise", emoji: "🏃", href: "/tracker/exercise" },
    { label: "Diet", emoji: "🥗", href: "/tracker/diet" },
    { label: "Hormones", emoji: "🔬", href: "/tracker/hormone" },
  ];

  const phaseGradients: Record<string, string> = {
    Menstrual: "linear-gradient(135deg, #8B4A4A 0%, #C17B7B 100%)",
    Follicular: "linear-gradient(135deg, #C17B7B 0%, #D4978A 100%)",
    Ovulatory: "linear-gradient(135deg, #D4978A 0%, #E8B89A 100%)",
    Luteal: "linear-gradient(135deg, #8C6B63 0%, #C17B7B 100%)",
    Unknown: "linear-gradient(135deg, #C17B7B 0%, #D4978A 100%)",
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#FAF7F5" }}>
      {/* Nav */}
      <nav
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #EDE0D8",
        }}
        className="px-8 py-5 flex justify-between items-center sticky top-0 z-10"
      >
        <h1
          style={{
            fontFamily: "var(--font-playfair)",
            color: "#C17B7B",
            fontSize: "1.4rem",
            fontWeight: 600,
          }}
        >
          CycleWell
        </h1>
        <div className="flex items-center gap-6">
          {streak > 0 && (
            <div
              className="flex items-center gap-2"
              style={{
                backgroundColor: "#F5EAE8",
                padding: "6px 14px",
                borderRadius: "100px",
              }}
            >
              <span>🔥</span>
              <span
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#A05C5C",
                }}
              >
                {streak} day streak
              </span>
            </div>
          )}
          <span style={{ color: "#B09A95", fontSize: "0.85rem" }}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </span>
          <Link
            href="/sign-in"
            style={{ color: "#B09A95", fontSize: "0.85rem" }}
          >
            Sign out
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-8">
        {/* Greeting */}
        <div>
          <p
            style={{
              color: "#B09A95",
              fontSize: "0.9rem",
              marginBottom: "4px",
            }}
          >
            {greeting}
          </p>
          <h2
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "2.2rem",
              fontWeight: 700,
              color: "#2C1810",
            }}
          >
            {name} 🌸
          </h2>
        </div>

        {/* Immersive cycle card */}
        <div
          style={{
            background: phaseGradients[cycleInfo.phase],
            borderRadius: "24px",
            padding: "32px",
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background decoration */}
          <div
            style={{
              position: "absolute",
              top: "-40px",
              right: "-40px",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-60px",
              left: "-20px",
              width: "160px",
              height: "160px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.05)",
            }}
          />

          <div className="flex justify-between items-start relative">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span style={{ fontSize: "1.4rem" }}>{cycleInfo.emoji}</span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    opacity: 0.8,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {cycleInfo.phase} Phase
                </span>
              </div>
              {cycleInfo.day > 0 && (
                <div style={{ marginBottom: "8px" }}>
                  <span
                    style={{
                      fontSize: "4rem",
                      fontWeight: 700,
                      fontFamily: "var(--font-playfair)",
                      lineHeight: 1,
                    }}
                  >
                    {cycleInfo.day}
                  </span>
                  <span
                    style={{
                      fontSize: "1rem",
                      opacity: 0.8,
                      marginLeft: "8px",
                    }}
                  >
                    / {cycleLength}
                  </span>
                </div>
              )}
              <p
                style={{
                  fontSize: "0.9rem",
                  opacity: 0.85,
                  lineHeight: 1.5,
                  maxWidth: "240px",
                }}
              >
                {cycleInfo.description}
              </p>
            </div>

            {/* Cycle ring visualization */}
            <div
              style={{ position: "relative", width: "100px", height: "100px" }}
            >
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="8"
                  strokeDasharray={`${(cycleInfo.day / cycleLength) * 251} 251`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
                <text
                  x="50"
                  y="50"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                >
                  Day {cycleInfo.day || "?"}
                </text>
              </svg>
            </div>
          </div>

          <Link
            href="/tracker/period"
            style={{
              display: "inline-block",
              marginTop: "20px",
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "white",
              padding: "10px 22px",
              borderRadius: "100px",
              fontSize: "0.85rem",
              fontWeight: 600,
              textDecoration: "none",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          >
            {lastPeriod ? "Update period →" : "Log period →"}
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Cycle Day",
              value: cycleInfo.day || "—",
              sub: cycleInfo.phase,
            },
            {
              label: "Logs Today",
              value: loggedToday ? "✓" : "0",
              sub: "Keep it up!",
            },
            {
              label: "Day Streak",
              value: streak || "—",
              sub: streak > 0 ? "🔥 On fire!" : "Start today",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #EDE0D8",
                borderRadius: "20px",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  color: "#2C1810",
                  fontFamily: "var(--font-playfair)",
                }}
              >
                {stat.value}
              </p>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "#B09A95",
                  marginTop: "2px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {stat.label}
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#C17B7B",
                  marginTop: "4px",
                }}
              >
                {stat.sub}
              </p>
            </div>
          ))}
        </div>

        {/* AI tip card */}
        <div
          style={{
            background: "linear-gradient(135deg, #F5EAE8 0%, #FAF7F5 100%)",
            border: "1px solid #EDE0D8",
            borderRadius: "20px",
            padding: "24px",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span style={{ fontSize: "1.1rem" }}>✨</span>
            <p
              style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "#B09A95",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Your daily insight
            </p>
            <span
              style={{
                marginLeft: "auto",
                fontSize: "0.7rem",
                backgroundColor: "#FFFFFF",
                color: "#C17B7B",
                padding: "3px 10px",
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
              fontSize: "0.95rem",
              color: "#2C1810",
              lineHeight: 1.7,
              fontStyle: "italic",
              fontFamily: "var(--font-playfair)",
            }}
          >
            "{aiTip}"
          </p>
        </div>

        {/* Quick log */}
        <div>
          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "#B09A95",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "14px",
            }}
          >
            Quick Log
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
            }}
          >
            {quickLogs.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #EDE0D8",
                  borderRadius: "16px",
                  padding: "18px 8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: "1.6rem" }}>{item.emoji}</span>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "#8C6B63",
                    fontWeight: 500,
                  }}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent mood */}
        {user.moodLogs.length > 0 && (
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #EDE0D8",
              borderRadius: "20px",
              padding: "24px",
            }}
          >
            <p
              style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "#B09A95",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "16px",
              }}
            >
              Recent Moods
            </p>
            <div className="flex gap-3">
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
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span style={{ fontSize: "1.4rem" }}>
                      {moodEmojis[log.mood] || "🌸"}
                    </span>
                    <span style={{ fontSize: "0.65rem", color: "#B09A95" }}>
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

        {/* Profile summary */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #EDE0D8",
            borderRadius: "20px",
            padding: "24px",
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <p
              style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "#B09A95",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Your Profile
            </p>
            <Link
              href="/onboarding"
              style={{ fontSize: "0.8rem", color: "#C17B7B" }}
            >
              Edit →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Goal", value: user.profile.primaryGoal },
              { label: "Activity", value: user.profile.activityLevel },
              { label: "Diet", value: user.profile.dietaryPref },
              { label: "Cycle length", value: user.profile.cycleLength },
            ].map((item) => (
              <div key={item.label}>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#B09A95",
                    marginBottom: "2px",
                  }}
                >
                  {item.label}
                </p>
                <p
                  style={{
                    fontSize: "0.9rem",
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
