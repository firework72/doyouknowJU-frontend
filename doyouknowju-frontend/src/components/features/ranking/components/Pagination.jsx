
import { Button } from '../../../common';
import styles from './Pagination.module.css';

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
        <nav className={styles.pagination}>
            <ul className={styles.list}>
                <li>
                    <Button variant="secondary" onClick={() => handlePrevious(100)}>&lt;&lt;&lt;</Button>
                </li>
                <li>
                    <Button variant="secondary" onClick={() => handlePrevious(10)}>&lt;&lt;</Button>
                </li>
                <li>
                    <Button variant="secondary" onClick={() => handlePrevious(1)}>&lt;</Button>
                </li>
                {
                    pages.map((page) => (
                        <li key={page}>
                            <Button variant={page === currentPage ? "primary" : "secondary"} onClick={() => onPageChange(page)}>{page}</Button>
                        </li>
                    ))
                }
                <li>
                    <Button variant="secondary" onClick={() => handleNext(1)}>&gt;</Button>
                </li>
                <li>
                    <Button variant="secondary" onClick={() => handleNext(10)}>&gt;&gt;</Button>
                </li>
                <li>
                    <Button variant="secondary" onClick={() => handleNext(100)}>&gt;&gt;&gt;</Button>
                </li>
            </ul>
        </nav>
    )
}

export default Pagination;