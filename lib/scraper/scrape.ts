import { SCRAPER_CONFIG, passesFilters, RawDomain } from "./filters";

const WHOISFREAKS_API_URL = "https://files.whoisfreaks.com/v3.1/domains/dropped/gtld";

export async function scrapeDomains() {
  const apiKey = process.env.APIKEY;
  if (!apiKey) {
    throw new Error("WhoisFreaks APIKEY is missing in environment variables.");
  }

  // Use 'yesterday' as the API supports it directly
  const targetDate = "yesterday"; 
  
  console.log(`Fetching dropped domains from WhoisFreaks for: ${targetDate}...`);

  try {
    const url = `${WHOISFREAKS_API_URL}?apiKey=${apiKey}&date=${targetDate}&tlds=com`;
    console.log(`Requesting URL: ${url.replace(apiKey, "HIDDEN")}`);
    
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WhoisFreaks API error: ${response.status} - ${errorText}`);
    }

    const domainsList = await response.json();
    
    // WhoisFreaks v3.1 dropped domains response is a simple array of strings:
    // [ "domain1.com", "domain2.com", ... ]
    if (!Array.isArray(domainsList)) {
      console.warn("Unexpected API response structure (expected array):", domainsList);
      return [];
    }

    console.log(`API returned ${domainsList.length} domains.`);

    const mappedDomains: RawDomain[] = domainsList.map((domainName: string) => {
      const name = domainName;
      const tld = name.split(".").pop()?.toLowerCase() || "";
      
      return {
        name,
        tld,
        length: name.split(".")[0].length,
        aby: null, 
        wby: null,
        backlinks: null,
        dropDate: new Date(),
      };
    });

    const validDomains = mappedDomains.filter(passesFilters);
    console.log(`Filtered down to ${validDomains.length} domains matching criteria.`);

    return validDomains;

  } catch (error) {
    console.error("Error fetching domains from WhoisFreaks:", error);
    throw error;
  }
}
