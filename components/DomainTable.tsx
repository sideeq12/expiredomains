"use client";

import { Domain } from "@/lib/types";

interface DomainTableProps {
  domains: Domain[];
  isLoading?: boolean;
  sortBy: string;
  sortDir: "asc" | "desc";
  onSort: (field: string) => void;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-white/5">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 w-full animate-pulse rounded bg-white/10" />
        </td>
      ))}
    </tr>
  );
}

function formatDate(date: Date | string | null) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const COLUMN_HEADERS = [
  { label: "Domain Name", field: "name" },
  { label: "Length", field: "length" },
  { label: "ABY", field: "aby" },
  { label: "WBY", field: "wby" },
  { label: "Backlinks", field: "backlinks" },
  { label: "Drop Date", field: "dropDate" },
];

export default function DomainTable({ 
  domains, 
  isLoading, 
  sortBy, 
  sortDir, 
  onSort 
}: DomainTableProps) {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-white/10 bg-gray-900/50 backdrop-blur-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03]">
              {COLUMN_HEADERS.map((col) => (
                <th key={col.field} className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} cols={COLUMN_HEADERS.length} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (domains.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-gray-900/50 px-6 py-16 text-center backdrop-blur-sm">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-7 w-7 text-gray-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-300">No domains found</p>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-gray-900/50 backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03]">
              {COLUMN_HEADERS.map((col) => (
                <th 
                  key={col.field} 
                  className="group cursor-pointer px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
                  onClick={() => onSort(col.field)}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    <span className={`transition-opacity ${sortBy === col.field ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`}>
                      {sortBy === col.field && sortDir === "asc" ? "↑" : "↓"}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {domains.map((domain) => (
              <tr
                key={domain.id}
                className="border-b border-white/5 transition-colors hover:bg-white/[0.03]"
              >
                <td className="px-6 py-4">
                  <span className="font-medium text-white">{domain.name}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {domain.length}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    (domain.aby || 0) >= 5 ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-gray-400"
                  }`}>
                    {domain.aby || 0}y
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {domain.wby || 0}y
                </td>
                <td className="px-6 py-4 text-sm text-gray-400 text-right">
                  {domain.backlinks?.toLocaleString() || 0}
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {formatDate(domain.dropDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
