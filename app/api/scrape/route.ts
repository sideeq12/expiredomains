export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { scrapeDomains } from "@/lib/scraper/scrape";
import { storeScrapedDomains } from "@/lib/scraper/store";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-scrape-secret");
  
  if (!secret || secret !== process.env.SCRAPE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // We launch this asynchronously so we don't timeout the request
    // This is a "fire and forget" trigger for manual runs
    (async () => {
      try {
        const domains = await scrapeDomains();
        await storeScrapedDomains(domains);
      } catch (err) {
        console.error("Manual scrape run failed:", err);
      }
    })();

    return NextResponse.json({ message: "Scrape run started" });
  } catch (error) {
    console.error("Failed to start scrape run:", error);
    return NextResponse.json(
      { error: "Failed to start scrape run" },
      { status: 500 }
    );
  }
}
