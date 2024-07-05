import React, { useState, useCallback, useEffect } from "react";

export default function Pagination({
  filteredData,
  setCurrentData,
  setIndexOfFirstItem,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  /** pagination */
  const itemsPerPage = 6;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentData(currentData);
    setIndexOfFirstItem(indexOfFirstItem); // update the indexOfFirstItem
  }, [currentPage, filteredData, indexOfFirstItem]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  return (
    <div className="pagination-controls">
      <button onClick={handlePreviousPage} disabled={currentPage === 1}>
        Prev
      </button>
      <span>
        {currentPage} of {totalPages} Pages
      </span>
      <button onClick={handleNextPage} disabled={currentPage === totalPages}>
        Next
      </button>
    </div>
  );
}
