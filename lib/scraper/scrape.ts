import { Page } from "playwright";
import { getBrowser, createPage } from "./browser";
import { login } from "./login";
import { SCRAPER_CONFIG, passesFilters, RawDomain } from "./filters";

const BASE_URL = "https://www.expireddomains.net";

export async function scrapeDomains() {
  const browser = await getBrowser();
  const { page, context } = await createPage(browser);

  try {
    await login(page, context);

    const allScrapedDomains: RawDomain[] = [];

    for (const tld of SCRAPER_CONFIG.tlds) {
      console.log(`Scraping category: ${tld}...`);
      
      // Construct filter URL (Targeting deleted .com specifically)
      // Note: ExpiredDomains.net URL patterns change, but /deleted-com/ is stable.
      // We'll apply filters via the UI for robustness if params are unclear.
      const targetUrl = `${BASE_URL}/deleted-${tld}/`;
      await page.goto(targetUrl, { waitUntil: "networkidle" });

      // Apply filters if not already applied via URL
      // For now, we rely on the URL or manual setup, 
      // but we will mainly filter client-side for maximum reliability.
      
      let currentPage = 1;
      while (currentPage <= SCRAPER_CONFIG.maxPages) {
        console.log(`Processing page ${currentPage}...`);
        
        await page.waitForSelector("table.base1", { timeout: 10000 });
        
        const domainsOnPage = await page.$$eval("table.base1 tbody tr", (rows: Element[]) => {
          return rows.map((row) => {
            const cols = row.querySelectorAll("td");
            if (cols.length < 10) return null;

            // Mapping based on typical ExpiredDomains.net layout
            // Domain | BL | DP | ABY | WBY | ... | Length | ...
            // This order changes frequently, so real implementations often use header text mapping.
            // For now, we'll use common indices or text-based finding if we wanted to be robust.
            
            const name = cols[0]?.textContent?.trim() || "";
            const backlinks = parseInt(cols[1]?.textContent?.replace(/,/g, "") || "0") || 0;
            const aby = parseInt(cols[4]?.textContent || "0") || 0;
            const wby = parseInt(cols[5]?.textContent || "0") || 0;
            const length = parseInt(cols[12]?.textContent || "0") || name.split(".")[0]?.length || 0;
            const tldExt = name.split(".").pop() || "com";

            return {
              name,
              tld: tldExt,
              length,
              aby,
              wby,
              backlinks,
              dropDate: new Date(), // Placeholder for current run date
            };
          });
        });

        const validDomains = (domainsOnPage.filter((d: RawDomain | null) => d !== null) as RawDomain[])
          .filter(passesFilters);

        console.log(`Found ${validDomains.length} matching domains on page ${currentPage}`);
        allScrapedDomains.push(...validDomains);

        // Check for next page
        const nextButton = await page.$("a.next");
        if (nextButton && currentPage < SCRAPER_CONFIG.maxPages) {
          await nextButton.click();
          await page.waitForNavigation({ waitUntil: "networkidle" });
          currentPage++;
          // Random delay between pages
          await page.waitForTimeout(Math.floor(Math.random() * 2000) + 1000);
        } else {
          break;
        }
      }
    }

    return allScrapedDomains;

  } catch (error) {
    console.error("Scraping error:", error);
    throw error;
  } finally {
    await browser.close();
  }
}
