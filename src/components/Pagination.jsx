import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

export default function Pagination({
  pageNo,
  pageSize,
  totalCount,
  onPageChange
}) {
  const totalPages = Math.ceil(totalCount / pageSize);

  const createPageRange = () => {
    const delta = 2;
    const range = [];

    for (let i = Math.max(2, pageNo - delta); i <= Math.min(totalPages - 1, pageNo + delta); i++) {
      range.push(i);
    }

    if (pageNo - delta > 2) range.unshift('...');
    if (pageNo + delta < totalPages - 1) range.push('...');

    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);

    return range;
  };

  return (
    <div className="flex items-center justify-between border-t dark:bg-blue-800 border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(pageNo - 1, 1))}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 dark:text-amber-50 hover:bg-gray-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(pageNo + 1, totalPages))}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-amber-50">
            Showing <span className="font-medium">{(pageNo - 1) * pageSize + 1}</span> to{' '}
            <span className="font-medium">{Math.min(pageNo * pageSize, totalCount)}</span> of{' '}
            <span className="font-medium">{totalCount}</span> results
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(Math.max(pageNo - 1, 1))}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            {createPageRange().map((page, idx) => (
              typeof page === 'number' ? (
                <button
                  key={idx}
                  onClick={() => onPageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 ${
                    page === pageNo
                      ? 'z-10 bg-indigo-600 text-white'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ) : (
                <span
                  key={idx}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                >
                  ...
                </span>
              )
            ))}
            <button
              onClick={() => onPageChange(Math.min(pageNo + 1, totalPages))}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
