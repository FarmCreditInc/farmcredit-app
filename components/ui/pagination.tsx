"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  siblingCount?: number
}

export function Pagination({ currentPage, totalPages, onPageChange, siblingCount = 1 }: PaginationProps) {
  // Generate page numbers to display
  const generatePagination = () => {
    // Always show first and last page
    const firstPage = 1
    const lastPage = totalPages

    // Calculate range of pages to show around current page
    const leftSiblingIndex = Math.max(currentPage - siblingCount, firstPage)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, lastPage)

    // Determine whether to show ellipses
    const shouldShowLeftDots = leftSiblingIndex > firstPage + 1
    const shouldShowRightDots = rightSiblingIndex < lastPage - 1

    // Generate array of page numbers to display
    const pageNumbers = []

    // Always add first page
    if (firstPage < leftSiblingIndex) {
      pageNumbers.push(firstPage)
    }

    // Add left ellipsis if needed
    if (shouldShowLeftDots) {
      pageNumbers.push(-1) // Use -1 to represent ellipsis
    }

    // Add pages around current page
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      pageNumbers.push(i)
    }

    // Add right ellipsis if needed
    if (shouldShowRightDots) {
      pageNumbers.push(-2) // Use -2 to represent ellipsis
    }

    // Always add last page
    if (lastPage > rightSiblingIndex) {
      pageNumbers.push(lastPage)
    }

    return pageNumbers
  }

  const pageNumbers = generatePagination()

  return (
    <div className="flex items-center justify-center space-x-2">
      <Button variant="outline" size="icon" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>

      {pageNumbers.map((page, index) => {
        // Render ellipsis
        if (page < 0) {
          return (
            <Button key={`ellipsis-${index}`} variant="outline" size="icon" disabled className="cursor-default">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More pages</span>
            </Button>
          )
        }

        // Render page number
        return (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            onClick={() => onPageChange(page)}
            className="w-9 h-9"
          >
            {page}
          </Button>
        )
      })}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>
    </div>
  )
}
