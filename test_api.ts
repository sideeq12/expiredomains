import { scrapeDomains } from "./lib/scraper/scrape";
import * as dotenv from "dotenv";

dotenv.config();

async function test() {
  console.log("Starting WhoisFreaks API test...");
  console.log("APIKEY length:", process.env.APIKEY?.length || 0);
  try {
    const domains = await scrapeDomains();
    console.log(`Successfully fetched and filtered ${domains.length} domains.`);
    if (domains.length > 0) {
      console.log("First 3 results:", JSON.stringify(domains.slice(0, 3), null, 2));
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

test();
