export interface Domain {
  id: string;
  name: string;
  tld: string;
  length: number;
  aby: number | null;
  wby: number | null;
  backlinks: number | null;
  dropDate: Date | null;
  scrapedAt: Date;
  createdAt: Date;
}

export interface ScrapeRun {
  id: string;
  startedAt: Date;
  finishedAt: Date | null;
  status: string;
  count: number | null;
  error: string | null;
}
