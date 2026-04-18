export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "25");
  const skip = (page - 1) * limit;

  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortDir = searchParams.get("sortDir") || "desc";
  const search = searchParams.get("search") || "";
  
  const minAby = parseInt(searchParams.get("minAby") || "0");
  const maxLength = parseInt(searchParams.get("maxLength") || "100");

  try {
    const where: any = {
      AND: [
        { name: { contains: search, mode: "insensitive" } },
        { aby: { gte: minAby } },
        { length: { lte: maxLength } },
      ],
    };

    const [domains, total] = await Promise.all([
      prisma.domain.findMany({
        where,
        orderBy: { [sortBy]: sortDir },
        skip,
        take: limit,
      }),
      prisma.domain.count({ where }),
    ]);

    return NextResponse.json({
      data: domains,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Failed to fetch domains:", error);
    return NextResponse.json(
      { error: "Failed to fetch domains" },
      { status: 500 }
    );
  }
}
