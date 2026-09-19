import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({
  currentPage,
  totalPages,
  totalElements,
  onPageChange,
  pageSize = 20,
}: {
  currentPage: number;
  totalPages: number;
  totalElements?: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
}) {
  if (totalPages <= 1 && (!totalElements || totalElements <= pageSize)) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-stone-200 text-xs text-stone-600 bg-white">
      <div>
        {totalElements !== undefined ? (
          <span>
            Showing <strong className="font-semibold">{currentPage * pageSize + 1}</strong> to{' '}
            <strong className="font-semibold">
              {Math.min((currentPage + 1) * pageSize, totalElements)}
            </strong>{' '}
            of <strong className="font-semibold">{totalElements}</strong> records
          </span>
        ) : (
          <span>
            Page <strong className="font-semibold">{currentPage + 1}</strong> of{' '}
            <strong className="font-semibold">{totalPages}</strong>
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 0}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Previous
        </button>
        <span className="px-2 font-medium">
          {currentPage + 1} / {Math.max(totalPages, 1)}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          aria-label="Next page"
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
