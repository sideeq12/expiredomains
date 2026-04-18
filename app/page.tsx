"use client";

import { useEffect, useState, useCallback } from "react";
import { Domain, ScrapeRun } from "@/lib/types";
import DomainTable from "@/components/DomainTable";
import { useDebounce } from "@/lib/hooks/useDebounce"; // I'll create this

export default function HomePage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  
  const [minAby, setMinAby] = useState(0);
  const [maxLength, setMaxLength] = useState(12);

  const [lastScrape, setLastScrape] = useState<ScrapeRun | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const fetchDomains = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        search: debouncedSearch,
        sortBy,
        sortDir,
        minAby: minAby.toString(),
        maxLength: maxLength.toString(),
      });
      
      const res = await fetch(`/api/domains?${params.toString()}`);
      const result = await res.json();
      
      if (result.data) {
        setDomains(result.data);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch domains:", error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, sortBy, sortDir, minAby, maxLength]);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/scrape/status");
      const data = await res.json();
      if (data.id) setLastScrape(data);
    } catch (error) {
      console.error("Failed to fetch scrape status:", error);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
    setPage(1);
  };

  return (
    <main className="flex-1">
      {/* Hero section */}
      <section className="relative overflow-hidden border-b border-white/5 bg-gray-950">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600/20 via-indigo-600/20 to-purple-600/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-300">
            {lastScrape ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${lastScrape.status === "success" ? "bg-emerald-400" : "bg-amber-400"}`} />
                  <span className={`relative inline-flex h-2 w-2 rounded-full ${lastScrape.status === "success" ? "bg-emerald-500" : "bg-amber-500"}`} />
                </span>
                Last scraped: {new Date(lastScrape.startedAt).toLocaleString()} ({lastScrape.count || 0} found)
              </>
            ) : (
              "No scrape data yet"
            )}
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Domain{" "}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Scraper Dashboard
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
            Monitor and explore dropped domains with precision filters.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters and Search */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Search</label>
              <input 
                type="text" 
                placeholder="domain-name..." 
                className="rounded-lg border border-white/10 bg-gray-900 px-4 py-2 text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Min ABY</label>
              <div className="flex gap-2">
                {[0, 2, 5, 10].map((v) => (
                  <button 
                    key={v}
                    onClick={() => { setMinAby(v); setPage(1); }}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      minAby === v ? "bg-violet-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    {v}+
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Max Length</label>
              <div className="flex gap-2">
                {[8, 12, 15, 20].map((v) => (
                  <button 
                    key={v}
                    onClick={() => { setMaxLength(v); setPage(1); }}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      maxLength === v ? "bg-violet-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    ≤{v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Found <span className="font-semibold text-white">{total}</span> domains
          </div>
        </div>

        {/* Table */}
        <DomainTable 
          domains={domains} 
          isLoading={loading}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button 
              disabled={page === 1 || loading}
              onClick={() => setPage(page - 1)}
              className="rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 disabled:opacity-30"
            >
              Previous
            </button>
            <span className="text-sm text-gray-400">
              Page <span className="text-white">{page}</span> of {totalPages}
            </span>
            <button 
              disabled={page === totalPages || loading}
              onClick={() => setPage(page + 1)}
              className="rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
