import { scrapeDomains } from "../lib/scraper/scrape";
import { storeScrapedDomains } from "../lib/scraper/store";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Starting manual scrape run...");
  try {
    const domains = await scrapeDomains();
    await storeScrapedDomains(domains);
    console.log("Manual scrape run completed.");
    process.exit(0);
  } catch (error) {
    console.error("Manual scrape run failed:", error);
    process.exit(1);
  }
}

main();
