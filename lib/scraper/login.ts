import { Page } from "playwright";
import { saveCookies } from "./browser";

const LOGIN_URL = "https://www.expireddomains.net/login/";

export async function login(page: Page, context: any) {
  const email = process.env.EXPIREDDOMAINS_EMAIL;
  const password = process.env.EXPIREDDOMAINS_PASSWORD;

  if (!email || !password || email === "your@email.com") {
    throw new Error("Missing ExpiredDomains.net credentials in .env");
  }

  console.log("Navigating to login page...");
  await page.goto(LOGIN_URL, { waitUntil: "networkidle" });

  // Check if already logged in (look for logout link or account profile)
  const isLoggedIn = await page.$("a[href='/login/logout/']");
  if (isLoggedIn) {
    console.log("Already logged in via session cookies.");
    return true;
  }

  console.log("Performing login...");
  await page.fill('input[name="login"]', email);
  await page.fill('input[name="password"]', password);
  
  // Random delay to mimic human behavior
  await page.waitForTimeout(Math.floor(Math.random() * 2000) + 1000);

  await page.click('button[type="submit"]');

  // Wait for navigation or error
  try {
    await page.waitForNavigation({ waitUntil: "networkidle", timeout: 15000 });
  } catch (error) {
    console.error("Login navigation timeout or error.");
  }

  // Check for MFA or CAPTCHA
  const content = await page.content();
  if (content.includes("Two-Factor Authentication") || content.includes("2FA")) {
    console.log("MFA required. Please handle manually in the browser if possible, or provide a way to input code.");
    throw new Error("MFA_REQUIRED");
  }

  if (content.includes("g-recaptcha") || content.includes("CAPTCHA")) {
    console.log("CAPTCHA detected. Failing gracefully.");
    throw new Error("CAPTCHA_DETECTED");
  }

  const loggedInAfter = await page.$("a[href='/login/logout/']");
  if (loggedInAfter) {
    console.log("Login successful!");
    await saveCookies(context);
    return true;
  } else {
    throw new Error("Login failed: Could not find logout link after submit.");
  }
}
