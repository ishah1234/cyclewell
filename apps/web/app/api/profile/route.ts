import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Create user if doesn't exist
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: body.email,
      },
    });

    // Create profile
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        name: body.name,
        dateOfBirth: new Date(body.dateOfBirth),
        height: parseFloat(body.height),
        weight: parseFloat(body.weight),
        diagnosedPCOS: body.diagnosedPCOS === "Yes",
        cycleLength: body.cycleLength || null,
        periodLength: body.periodLength || null,
        primaryGoal: body.primaryGoal || null,
        activityLevel: body.activityLevel || null,
        dietaryPref: body.dietaryPref || null,
      },
      create: {
        userId: user.id,
        name: body.name,
        dateOfBirth: new Date(body.dateOfBirth),
        height: parseFloat(body.height),
        weight: parseFloat(body.weight),
        diagnosedPCOS: body.diagnosedPCOS === "Yes",
        cycleLength: body.cycleLength || null,
        periodLength: body.periodLength || null,
        primaryGoal: body.primaryGoal || null,
        activityLevel: body.activityLevel || null,
        dietaryPref: body.dietaryPref || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
