import { Browser, Page, BrowserContext } from "playwright";
import fs from "fs";
import path from "path";

const SESSION_FILE = path.join(process.cwd(), "lib", "scraper", "session.json");

/**
 * Returns a Playwright browser instance.
 * Uses dynamic imports to prevent build-time failures in serverless environments.
 */
export async function getBrowser(): Promise<Browser> {
  const { chromium } = await import("playwright-extra");
  const stealth = (await import("puppeteer-extra-plugin-stealth")).default;

  chromium.use(stealth());

  if (process.env.BROWSER_WS_ENDPOINT) {
    console.log("Connecting to remote browser via WebSocket...");
    return await chromium.connect(process.env.BROWSER_WS_ENDPOINT);
  }

  return await chromium.launch({
    headless: process.env.NODE_ENV === "production",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

/**
 * Creates a browser context with optional session restoration.
 */
export async function createPage(browser: Browser): Promise<{ page: Page; context: BrowserContext }> {
  let storageState: any = undefined;

  if (fs.existsSync(SESSION_FILE)) {
    try {
      storageState = JSON.parse(fs.readFileSync(SESSION_FILE, "utf-8"));
    } catch (e) {
      console.warn("Failed to load session cookies:", e);
    }
  }

  const context = await browser.newContext({ storageState });
  const page = await context.newPage();

  // Set a realistic viewport
  await page.setViewportSize({ width: 1280, height: 800 });

  return { page, context };
}

/**
 * Saves current browser session cookies.
 */
export async function saveCookies(context: BrowserContext) {
  const storageState = await context.storageState();
  const dir = path.dirname(SESSION_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SESSION_FILE, JSON.stringify(storageState, null, 2));
  console.log("Session cookies saved.");
}

export async function closeBrowser(browser: Browser, page?: Page) {
  if (page) await page.close();
  if (browser) await browser.close();
}
