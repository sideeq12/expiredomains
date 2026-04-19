import "dotenv/config";
import { scrapeDomains } from "../lib/scraper/scrape";
import { storeScrapedDomains } from "../lib/scraper/store";

async function main() {
  console.log("Starting manual scrape run...");
  try {
    const domains = await scrapeDomains();
    
    if (domains.length === 0) {
      console.log("No domains found matching the filters. Skipping database store.");
    } else {
      await storeScrapedDomains(domains);
      console.log(`Successfully stored ${domains.length} domains.`);
    }
    
    console.log("Manual scrape run completed.");
    process.exit(0);
  } catch (error) {
    console.error("Manual scrape run failed:", error);
    process.exit(1);
  }
}

main();
