import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        profile: true,
        cycleLogs: { orderBy: { startDate: "desc" }, take: 1 },
        moodLogs: { orderBy: { date: "desc" }, take: 3 },
        symptoms: { orderBy: { date: "desc" }, take: 3 },
      },
    });

    const { message } = await req.json();

    const lastPeriod = user?.cycleLogs[0]?.startDate;
    const cycleDay = lastPeriod
      ? Math.floor(
          (Date.now() - new Date(lastPeriod).getTime()) / (1000 * 60 * 60 * 24),
        ) + 1
      : null;

    const recentMoods =
      user?.moodLogs.map((m) => m.mood).join(", ") || "not logged";
    const recentSymptoms =
      user?.symptoms
        .flatMap((s) => s.symptoms)
        .slice(0, 5)
        .join(", ") || "none logged";
    const name = user?.profile?.name?.split(" ")[0] || "there";

    const systemPrompt = `You are a warm, knowledgeable PCOS wellness companion for ${name}.
    
Current context:
- Cycle day: ${cycleDay ? `Day ${cycleDay}` : "unknown (period not logged)"}
- Recent moods: ${recentMoods}
- Recent symptoms: ${recentSymptoms}
- Dietary preference: ${user?.profile?.dietaryPref || "not specified"}
- Activity level: ${user?.profile?.activityLevel || "not specified"}
- Primary goal: ${user?.profile?.primaryGoal || "not specified"}

Guidelines:
- Be warm, supportive and personal — address them by name occasionally
- Give specific, actionable advice tailored to PCOS
- Reference their cycle day and recent logs when relevant
- Keep responses concise (2-4 sentences max)
- Never give medical diagnoses — always suggest consulting a doctor for medical concerns
- Focus on lifestyle, nutrition, movement, and emotional wellbeing`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
    });

    const reply =
      response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
