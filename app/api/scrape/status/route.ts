export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const lastRun = await prisma.scrapeRun.findFirst({
      orderBy: { startedAt: "desc" },
    });

    return NextResponse.json(lastRun || { message: "No scrape runs yet" });
  } catch (error) {
    console.error("Failed to fetch scrape status:", error);
    return NextResponse.json(
      { error: "Failed to fetch status" },
      { status: 500 }
    );
  }
}
