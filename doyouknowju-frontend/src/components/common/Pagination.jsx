import React, { useMemo } from 'react';
import './Pagination.css';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const buildPageItems = (currentPage, totalPages, windowSize = 5) => {
  if (totalPages <= 0) return [];
  if (totalPages <= windowSize) {
    return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  }

  const half = Math.floor(windowSize / 2);
  let start = currentPage - half;
  let end = currentPage + half;

  if (start < 1) {
    start = 1;
    end = windowSize;
  }
  if (end > totalPages) {
    end = totalPages;
    start = totalPages - windowSize + 1;
  }

  const items = [];
  if (start > 1) items.push(1, 'ellipsis-left');

  for (let page = start; page <= end; page += 1) items.push(page);

  if (end < totalPages) items.push('ellipsis-right', totalPages);
  return items;
};

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  const safeTotalPages = Math.max(1, Number(totalPages) || 1);
  const safeCurrentPage = clamp(Number(currentPage) || 1, 1, safeTotalPages);

  const items = useMemo(
    () => buildPageItems(safeCurrentPage, safeTotalPages),
    [safeCurrentPage, safeTotalPages]
  );

  // if (safeTotalPages <= 1) return null;

  const goTo = (page) => {
    if (!onPageChange) return;
    const next = clamp(page, 1, safeTotalPages);
    if (next === safeCurrentPage) return;
    onPageChange(next);
  };

  return (
    <nav className="pagination" aria-label="페이지 네비게이션">
      <button
        type="button"
        className="pagination-btn"
        onClick={() => goTo(1)}
        disabled={safeCurrentPage === 1}
        aria-label="첫 페이지"
      >
        «
      </button>
      <button
        type="button"
        className="pagination-btn"
        onClick={() => goTo(safeCurrentPage - 1)}
        disabled={safeCurrentPage === 1}
        aria-label="이전 페이지"
      >
        ‹
      </button>

      {items.map((item) => {
        if (typeof item !== 'number') {
          return (
            <span key={item} className="pagination-ellipsis" aria-hidden="true">
              …
            </span>
          );
        }

        const isActive = item === safeCurrentPage;
        return (
          <button
            key={item}
            type="button"
            className={`pagination-btn ${isActive ? 'is-active' : ''}`}
            onClick={() => goTo(item)}
            aria-current={isActive ? 'page' : undefined}
          >
            {item}
          </button>
        );
      })}

      <button
        type="button"
        className="pagination-btn"
        onClick={() => goTo(safeCurrentPage + 1)}
        disabled={safeCurrentPage === safeTotalPages}
        aria-label="다음 페이지"
      >
        ›
      </button>
      <button
        type="button"
        className="pagination-btn"
        onClick={() => goTo(safeTotalPages)}
        disabled={safeCurrentPage === safeTotalPages}
        aria-label="마지막 페이지"
      >
        »
      </button>
    </nav>
  );
};

export default Pagination;

