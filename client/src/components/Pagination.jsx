


// src/components/Pagination.jsx
import React from "react";

export default function Pagination({ page, totalPages, onPageChange }) {
  const pages = [];
  const windowSize = 1; // number of neighbors around the current page

  // Always include first page
  pages.push(1);

  // Add left ellipsis if needed
  if (page - windowSize > 2) pages.push("...");

  // Add middle pages around current page
  for (let i = Math.max(2, page - windowSize); i <= Math.min(totalPages - 1, page + windowSize); i++) {
    pages.push(i);
  }

  // Add right ellipsis if needed
  if (page + windowSize < totalPages - 1) pages.push("...");

  // Always include last page if more than 1
  if (totalPages > 1) pages.push(totalPages);

  return (
    <div className="flex justify-center items-center gap-2 mt-4 select-none">
      {/* Prev Button */}
      <button
        className="px-3 py-1 rounded-full text-black hover:bg-[#C8FAD6]"
        disabled={page === 1}
        onClick={() => page > 1 && onPageChange(page - 1)}
      >
        &lt;
      </button>

      {/* Page Numbers */}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={i} className="px-2">…</span>
        ) : (
          <button
            key={i}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-full transition-colors ${
              p === page ? "bg-[#007867] text-white" : "text-black hover:bg-[#C8FAD6]"
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* Next Button */}
      <button
        className="px-3 py-1 rounded-full text-black hover:bg-[#C8FAD6]"
        disabled={page === totalPages}
        onClick={() => page < totalPages && onPageChange(page + 1)}
      >
        &gt;
      </button>
    </div>
  );
}
