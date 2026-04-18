export const SCRAPER_CONFIG = {
  tlds: ["com"], // Focused on .com as per the hardcoded filter rule
  filters: {
    maxLength: 12,
    noNumbers: true,
    noHyphens: true,
    minAby: 2,
    onlyAvailable: true,
  },
  maxPages: 5, // Limit per category to avoid detection
};

export interface RawDomain {
  name: string;
  tld: string;
  length: number;
  aby: number | null;
  wby: number | null;
  backlinks: number | null;
  dropDate: Date | null;
}

export function passesFilters(domain: RawDomain): boolean {
  const { filters } = SCRAPER_CONFIG;

  if (domain.tld.toLowerCase() !== "com") return false;
  if (domain.length > filters.maxLength) return false;
  
  if (filters.noNumbers && /\d/.test(domain.name)) return false;
  if (filters.noHyphens && domain.name.includes("-")) return false;
  
  if (domain.aby !== null && domain.aby < filters.minAby) return false;
  
  return true;
}
