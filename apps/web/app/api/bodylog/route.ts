import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.bodyLog.findFirst({
      where: { userId: user.id, date: { gte: today } },
    });

    let bodyLog;
    if (existing) {
      bodyLog = await prisma.bodyLog.update({
        where: { id: existing.id },
        data: {
          hydration: body.hydration ?? existing.hydration,
          sleep: body.sleep ?? existing.sleep,
          energy: body.energy ?? existing.energy,
        },
      });
    } else {
      bodyLog = await prisma.bodyLog.create({
        data: {
          userId: user.id,
          date: new Date(),
          hydration: body.hydration ?? null,
          sleep: body.sleep ?? null,
          energy: body.energy ?? null,
        },
      });
    }

    return NextResponse.json({ success: true, data: bodyLog });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bodyLog = await prisma.bodyLog.findFirst({
      where: { userId: user.id, date: { gte: today } },
    });

    return NextResponse.json({ success: true, data: bodyLog });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
