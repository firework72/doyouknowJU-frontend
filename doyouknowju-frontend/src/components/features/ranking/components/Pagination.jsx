
function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    pageGroupSize = 10,
}) {
    if (totalPages <= 1) return null;

    const currentGroup = Math.ceil(currentPage / pageGroupSize);
    const startPage = (currentGroup - 1) * pageGroupSize + 1;
    const endPage = currentGroup * pageGroupSize;

    const pages = [];

    for (let i = startPage; i <= Math.min(endPage, totalPages); i++) {
        pages.push(i);
    }

    const handlePrevious = (moves) => {
        const newPage = Math.max(1, currentPage - moves);
        onPageChange(newPage);
    }

    const handleNext = (moves) => {
        const newPage = Math.min(totalPages, currentPage + moves);
        onPageChange(newPage);
    }

    return (
        <nav>
            <ul>
                <li>
                    <button onClick={() => handlePrevious(100)}>&lt;&lt;&lt;</button>
                </li>
                <li>
                    <button onClick={() => handlePrevious(10)}>&lt;&lt;</button>
                </li>
                <li>
                    <button onClick={() => handlePrevious(1)}>&lt;</button>
                </li>
                {
                    pages.map((page) => (
                        <li key={page}>
                            <button onClick={() => onPageChange(page)}>{page}</button>
                        </li>
                    ))
                }
                <li>
                    <button onClick={() => handleNext(1)}>&gt;</button>
                </li>
                <li>
                    <button onClick={() => handleNext(10)}>&gt;&gt;</button>
                </li>
                <li>
                    <button onClick={() => handleNext(100)}>&gt;&gt;&gt;</button>
                </li>
            </ul>
        </nav>
    )
}

export default Pagination;