import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { profile: true },
    });

    return NextResponse.json({ success: true, data: user?.profile || null });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        name: body.name,
        height: body.height,
        weight: body.weight,
        dateOfBirth: new Date(body.dateOfBirth),
        cycleLength: body.cycleLength,
        periodLength: body.periodLength,
        primaryGoal: body.primaryGoal,
        activityLevel: body.activityLevel,
        dietaryPref: body.dietaryPref,
        diagnosedPCOS: body.diagnosedPCOS,
      },
      create: {
        userId: user.id,
        name: body.name,
        height: body.height,
        weight: body.weight,
        dateOfBirth: new Date(body.dateOfBirth),
        cycleLength: body.cycleLength,
        periodLength: body.periodLength,
        primaryGoal: body.primaryGoal,
        activityLevel: body.activityLevel,
        dietaryPref: body.dietaryPref,
        diagnosedPCOS: body.diagnosedPCOS,
      },
    });

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
