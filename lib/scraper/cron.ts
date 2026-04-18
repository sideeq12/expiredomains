import cron from "node-cron";
import { scrapeDomains } from "./scrape";
import { storeScrapedDomains } from "./store";

export function setupCron() {
  console.log("Setting up daily cron job (3 AM)...");

  // Run at 03:00 every day
  cron.schedule("0 3 * * *", async () => {
    console.log(`[${new Date().toISOString()}] Starting scheduled scrape run...`);
    try {
      const domains = await scrapeDomains();
      await storeScrapedDomains(domains);
      console.log(`[${new Date().toISOString()}] Scheduled scrape run completed successfully.`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Scheduled scrape run failed:`, error);
    }
  });

  // Optional: Run immediately on startup for testing in dev
  if (process.env.SCRAPE_ON_STARTUP === "true") {
    console.log("SCRAPE_ON_STARTUP is true. Triggering initial run...");
    scrapeDomains().then(storeScrapedDomains).catch(console.error);
  }
}
