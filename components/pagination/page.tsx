import React from "react";
import { Button } from "primereact/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = ""
}: PaginationProps) {
  // Não renderizar se não houver páginas suficientes
  if (totalPages <= 1) {
    return null;
  }


  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  // Função para gerar os números das páginas com ellipsis para muitas páginas
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      // Mostrar todas as páginas se houver poucas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica mais complexa para muitas páginas
      if (currentPage <= 4) {
        // Início: 1, 2, 3, 4, 5, ..., último
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Final: 1, ..., antepenúltimo, penúltimo, último
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Meio: 1, ..., atual-1, atual, atual+1, ..., último
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className={`flex items-center justify-center mt-6 px-4 ${className}`}>

      {/* Controles de navegação */}
      <div className="flex items-center gap-2">
        {/* Botão Anterior */}
        <Button
          icon="pi pi-angle-left"
          className="p-button-text p-button-sm"
          disabled={currentPage === 1}
          onClick={handlePreviousPage}
          style={{
            backgroundColor: currentPage === 1 ? '#f3f4f6' : '#e5e7eb',
            color: currentPage === 1 ? '#9ca3af' : '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            padding: '0.5rem 0.75rem'
          }}
          aria-label="Página anterior"
        />

        {/* Números das páginas */}
        {generatePageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-gray-500"
              >
                ...
              </span>
            );
          }

          const pageNumber = page as number;
          const isCurrentPage = pageNumber === currentPage;

          return (
            <Button
              key={pageNumber}
              label={pageNumber.toString()}
              className="p-button-sm"
              onClick={() => handlePageClick(pageNumber)}
              style={{
                backgroundColor: isCurrentPage ? '#dc2626' : '#e5e7eb',
                color: isCurrentPage ? 'white' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                padding: '0.5rem 0.75rem',
                minWidth: '2.5rem'
              }}
              aria-label={`Página ${pageNumber}`}
              aria-current={isCurrentPage ? 'page' : undefined}
            />
          );
        })}

        {/* Botão Próximo */}
        <Button
          icon="pi pi-angle-right"
          className="p-button-text p-button-sm"
          disabled={currentPage === totalPages}
          onClick={handleNextPage}
          style={{
            backgroundColor: currentPage === totalPages ? '#f3f4f6' : '#e5e7eb',
            color: currentPage === totalPages ? '#9ca3af' : '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            padding: '0.5rem 0.75rem'
          }}
          aria-label="Próxima página"
        />
      </div>
    </div>
  );
}