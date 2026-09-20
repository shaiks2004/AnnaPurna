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
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#DDE2DB] text-xs text-[#657169] bg-[#FFFFFF] rounded-b-xl">
      <div>
        {totalElements !== undefined ? (
          <span>
            Showing <strong className="font-semibold text-[#26332D]">{currentPage * pageSize + 1}</strong> to{' '}
            <strong className="font-semibold text-[#26332D]">
              {Math.min((currentPage + 1) * pageSize, totalElements)}
            </strong>{' '}
            of <strong className="font-semibold text-[#26332D]">{totalElements}</strong> records
          </span>
        ) : (
          <span>
            Page <strong className="font-semibold text-[#26332D]">{currentPage + 1}</strong> of{' '}
            <strong className="font-semibold text-[#26332D]">{totalPages}</strong>
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 font-heading">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 0}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#DDE2DB] bg-[#FFFFFF] text-[#26332D] hover:bg-[#F8F9F6] disabled:opacity-40 disabled:cursor-not-allowed transition font-medium text-xs shadow-2xs"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Previous
        </button>
        <span className="px-2 font-semibold text-[#26332D]">
          {currentPage + 1} / {Math.max(totalPages, 1)}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#DDE2DB] bg-[#FFFFFF] text-[#26332D] hover:bg-[#F8F9F6] disabled:opacity-40 disabled:cursor-not-allowed transition font-medium text-xs shadow-2xs"
          aria-label="Next page"
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
