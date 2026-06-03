export default function Pagination({ page, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    return (
        <div className="pagination">
            <button className="page-btn" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
                ← Prev
            </button>
            <span className="page-info">
        Page {page} of {totalPages}
      </span>
            <button className="page-btn" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
                Next →
            </button>
        </div>
    );
}