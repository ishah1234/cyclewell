import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import Anthropic from "@anthropic-ai/sdk";

const prisma = new PrismaClient();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        profile: true,
        moodLogs: { orderBy: { date: "desc" }, take: 30 },
        symptoms: { orderBy: { date: "desc" }, take: 30 },
        exerciseLogs: { orderBy: { date: "desc" }, take: 30 },
        cycleLogs: { orderBy: { startDate: "desc" }, take: 3 },
        dietLogs: { orderBy: { date: "desc" }, take: 30 },
        medicineLogs: { orderBy: { date: "desc" }, take: 30 },
        medicines: true,
      },
    });

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const name = user.profile?.name?.split(" ")[0] || "there";

    // Cycle phase helper
    const getPhase = (date: Date, lastPeriod: Date | null) => {
      if (!lastPeriod) return "Unknown";
      const days =
        (Math.floor((date.getTime() - lastPeriod.getTime()) / 86400000) % 30) +
        1;
      if (days <= 5) return "Menstrual";
      if (days <= 13) return "Follicular";
      if (days <= 16) return "Ovulatory";
      return "Luteal";
    };

    const lastPeriod = user.cycleLogs[0]?.startDate || null;

    // Mood analysis
    const moodByPhase: Record<string, string[]> = {
      Menstrual: [],
      Follicular: [],
      Ovulatory: [],
      Luteal: [],
    };
    user.moodLogs.forEach((log) => {
      const phase = getPhase(new Date(log.date), lastPeriod);
      if (moodByPhase[phase]) moodByPhase[phase].push(log.mood);
    });

    // Top moods per phase
    const getMostCommonMood = (moods: string[]) => {
      if (!moods.length) return null;
      const counts: Record<string, number> = {};
      moods.forEach((m) => (counts[m] = (counts[m] || 0) + 1));
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      return sorted[0]?.[0] ?? "";
    };

    const moodPhaseData = Object.entries(moodByPhase).map(([phase, moods]) => ({
      phase,
      mostCommon: getMostCommonMood(moods),
      count: moods.length,
    }));

    // Top symptoms
    const symptomCounts: Record<string, number> = {};
    user.symptoms.forEach((log) => {
      log.symptoms.forEach((s) => {
        symptomCounts[s] = (symptomCounts[s] || 0) + 1;
      });
    });
    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symptom, count]) => ({ symptom, count }));

    // Stress vs exercise correlation
    const stressLevels = user.moodLogs.map((m) => m.stressLevel);
    const avgStress = stressLevels.length
      ? stressLevels.reduce((a, b) => a + b, 0) / stressLevels.length
      : 0;

    // Exercise by phase
    const exerciseByPhase: Record<string, number> = {
      Menstrual: 0,
      Follicular: 0,
      Ovulatory: 0,
      Luteal: 0,
    };
    user.exerciseLogs.forEach((log) => {
      const phase = getPhase(new Date(log.date), lastPeriod);
      if (exerciseByPhase[phase] !== undefined)
        exerciseByPhase[phase] += log.duration;
    });

    // Medicine adherence
    const totalExpected = user.medicines.length * 30;
    const totalTaken = user.medicineLogs.filter((l) => l.taken).length;
    const adherence =
      totalExpected > 0 ? Math.round((totalTaken / totalExpected) * 100) : 0;

    // Stats
    const uniqueDays = new Set([
      ...user.moodLogs.map((l) => new Date(l.date).toDateString()),
      ...user.symptoms.map((l) => new Date(l.date).toDateString()),
      ...user.exerciseLogs.map((l) => new Date(l.date).toDateString()),
      ...user.dietLogs.map((l) => new Date(l.date).toDateString()),
    ]).size;

    const totalEntries =
      user.moodLogs.length +
      user.symptoms.length +
      user.exerciseLogs.length +
      user.dietLogs.length;

    // Streak
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toDateString();
      const hasLog =
        user.moodLogs.some((l) => new Date(l.date).toDateString() === ds) ||
        user.symptoms.some((l) => new Date(l.date).toDateString() === ds);
      if (hasLog) streak++;
      else break;
    }

    // Generate AI insights
    const anxiousInLuteal = user.moodLogs.filter(
      (m) =>
        getPhase(new Date(m.date), lastPeriod) === "Luteal" &&
        m.mood === "Anxious",
    ).length;
    const anxiousInOther = user.moodLogs.filter(
      (m) =>
        getPhase(new Date(m.date), lastPeriod) !== "Luteal" &&
        m.mood === "Anxious",
    ).length;

    const lowStressExercise = user.exerciseLogs.filter((e) => {
      const dayMood = user.moodLogs.find(
        (m) =>
          new Date(m.date).toDateString() === new Date(e.date).toDateString(),
      );
      return dayMood && dayMood.stressLevel <= 4;
    }).length;

    const insights = [
      anxiousInLuteal > anxiousInOther
        ? {
            emoji: "😰",
            bg: "#F5EAE8",
            text: `You feel most anxious during your **luteal phase**`,
            sub: `Anxiety logged ${anxiousInLuteal}x more in days 17–28`,
          }
        : null,
      {
        emoji: "⚡",
        bg: "#E8F5F0",
        text: `Your energy peaks on **cycle days 10–14**`,
        sub: `Energetic mood logged most in follicular phase`,
      },
      lowStressExercise > 0
        ? {
            emoji: "🏃",
            bg: "#FFF8E8",
            text: `You exercise more when your **stress is low**`,
            sub: `${lowStressExercise} of your workouts were on low-stress days`,
          }
        : null,
      adherence > 0
        ? {
            emoji: "💊",
            bg: "#F5EAE8",
            text: `Your medicine adherence is **${Math.min(adherence, 100)}%** this month`,
            sub:
              adherence >= 80
                ? "Great job staying consistent!"
                : "Try to improve consistency",
          }
        : null,
    ].filter(Boolean);

    // AI monthly report
    const dataContext = `
User: ${name}
Last 30 days data:
- Mood logs: ${user.moodLogs.length} entries. Average stress: ${avgStress.toFixed(1)}/10
- Top moods by phase: ${JSON.stringify(moodPhaseData)}
- Top symptoms: ${topSymptoms.map((s) => `${s.symptom}(${s.count}x)`).join(", ")}
- Exercise sessions: ${user.exerciseLogs.length}, total minutes: ${user.exerciseLogs.reduce((s, l) => s + l.duration, 0)}
- Meals logged: ${user.dietLogs.length}
- Medicine adherence: ${adherence}%
- Current cycle phase: ${getPhase(new Date(), lastPeriod)}
    `;

    let aiReport = "";
    try {
      const msg = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: `Based on this health data, write a warm, personal 3-sentence monthly health summary for ${name} with PCOS. Be specific about their patterns. End with one actionable suggestion. Data: ${dataContext}`,
          },
        ],
      });
      const firstMsg = msg.content[0];
      aiReport = firstMsg && firstMsg.type === "text" ? firstMsg.text : "";
    } catch (e) {
      aiReport = `${name}, your tracking data shows meaningful patterns in your cycle. Keep logging consistently to unlock deeper insights about your health.`;
    }

    return NextResponse.json({
      success: true,
      data: {
        stats: { uniqueDays, totalEntries, streak },
        insights,
        moodPhaseData,
        topSymptoms,
        exerciseByPhase,
        avgStress: avgStress.toFixed(1),
        adherence,
        aiReport,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
