import { useState, useEffect, useRef, useCallback } from 'react'
import { usePDFStore } from '../../stores'
import { PDFService } from '../../utils/pdf'
import { cn } from '../../utils'
import { Spinner } from '../ui'

export function PDFViewer({ className }) {
  const {
    currentDocument,
    currentPage,
    scale,
    rotation,
    viewMode,
    isLoading,
    error,
    setLoading,
    setError,
    setDocumentPages
  } = usePDFStore()

  const [renderedPages, setRenderedPages] = useState(new Map())
  const containerRef = useRef(null)
  const pdf = useRef(null)

  // Load PDF when document changes
  useEffect(() => {
    if (!currentDocument) {
      pdf.current = null
      setRenderedPages(new Map())
      return
    }

    loadPDF()
  }, [currentDocument])

  // Re-render pages when scale or rotation changes
  useEffect(() => {
    if (pdf.current) {
      renderVisiblePages()
    }
  }, [scale, rotation, currentPage, viewMode])

  const loadPDF = async () => {
    if (!currentDocument) return

    setLoading(true)
    setError(null)

    try {
      const pdfData = await PDFService.loadPDF(currentDocument)
      pdf.current = pdfData.pdf

      // Pre-render first few pages
      const pages = []
      const numPages = Math.min(5, pdfData.numPages) // Render first 5 pages initially

      for (let i = 1; i <= numPages; i++) {
        try {
          const pageData = await PDFService.renderPage(pdf.current, i, scale, rotation)
          pages.push({
            pageNumber: i,
            canvas: pageData.canvas,
            viewport: pageData.viewport
          })
        } catch (error) {
          console.error(`Failed to render page ${i}:`, error)
        }
      }

      const pageMap = new Map()
      pages.forEach(page => {
        pageMap.set(page.pageNumber, page)
      })

      setRenderedPages(pageMap)
      setDocumentPages(Array.from({ length: pdfData.numPages }, (_, i) => i + 1))
    } catch (error) {
      setError(error.message)
      console.error('Failed to load PDF:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderVisiblePages = useCallback(async () => {
    if (!pdf.current) return

    const visiblePages = getVisiblePages()
    const newRenderedPages = new Map(renderedPages)

    for (const pageNum of visiblePages) {
      if (!newRenderedPages.has(pageNum)) {
        try {
          const pageData = await PDFService.renderPage(pdf.current, pageNum, scale, rotation)
          newRenderedPages.set(pageNum, {
            pageNumber: pageNum,
            canvas: pageData.canvas,
            viewport: pageData.viewport
          })
        } catch (error) {
          console.error(`Failed to render page ${pageNum}:`, error)
        }
      }
    }

    setRenderedPages(newRenderedPages)
  }, [pdf.current, renderedPages, scale, rotation, currentPage, viewMode])

  const getVisiblePages = () => {
    if (viewMode === 'single') {
      return [currentPage]
    } else if (viewMode === 'facing') {
      return currentPage % 2 === 1 ? [currentPage, currentPage + 1] : [currentPage - 1, currentPage]
    } else {
      // Continuous view - return current page and surrounding pages
      const totalPages = pdf.current?.numPages || 0
      const pages = []
      for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        pages.push(i)
      }
      return pages
    }
  }

  const handleScroll = useCallback(() => {
    if (viewMode === 'continuous') {
      // Lazy load pages as user scrolls
      renderVisiblePages()
    }
  }, [viewMode, renderVisiblePages])

  useEffect(() => {
    const container = containerRef.current
    if (container && viewMode === 'continuous') {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll, viewMode])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-secondary-600">Loading PDF...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-600">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-lg font-medium mb-2">Error loading PDF</p>
          <p className="text-sm text-secondary-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!currentDocument) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-secondary-400">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium mb-2">No document loaded</p>
          <p className="text-sm">Upload a PDF file to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex-1 overflow-auto bg-secondary-50',
        viewMode === 'continuous' ? 'flex flex-col items-center py-4 space-y-4' : 'flex items-center justify-center p-4',
        className
      )}
    >
      {viewMode === 'single' && (
        <SinglePageView 
          pageData={renderedPages.get(currentPage)}
          pageNumber={currentPage}
        />
      )}
      
      {viewMode === 'facing' && (
        <FacingPageView 
          leftPage={renderedPages.get(currentPage % 2 === 1 ? currentPage : currentPage - 1)}
          rightPage={renderedPages.get(currentPage % 2 === 1 ? currentPage + 1 : currentPage)}
        />
      )}
      
      {viewMode === 'continuous' && (
        <ContinuousView 
          renderedPages={renderedPages}
          totalPages={pdf.current?.numPages || 0}
        />
      )}
    </div>
  )
}

function SinglePageView({ pageData, pageNumber }) {
  if (!pageData) {
    return (
      <div className="flex items-center justify-center bg-white shadow-lg rounded-lg p-8">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
      <canvas
        ref={(canvas) => {
          if (canvas && pageData.canvas) {
            const ctx = canvas.getContext('2d')
            canvas.width = pageData.canvas.width
            canvas.height = pageData.canvas.height
            ctx.drawImage(pageData.canvas, 0, 0)
          }
        }}
        className="max-w-full max-h-full"
      />
    </div>
  )
}

function FacingPageView({ leftPage, rightPage }) {
  return (
    <div className="flex gap-4">
      {leftPage && (
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
          <canvas
            ref={(canvas) => {
              if (canvas && leftPage.canvas) {
                const ctx = canvas.getContext('2d')
                canvas.width = leftPage.canvas.width
                canvas.height = leftPage.canvas.height
                ctx.drawImage(leftPage.canvas, 0, 0)
              }
            }}
            className="max-w-full max-h-full"
          />
        </div>
      )}
      
      {rightPage && (
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
          <canvas
            ref={(canvas) => {
              if (canvas && rightPage.canvas) {
                const ctx = canvas.getContext('2d')
                canvas.width = rightPage.canvas.width
                canvas.height = rightPage.canvas.height
                ctx.drawImage(rightPage.canvas, 0, 0)
              }
            }}
            className="max-w-full max-h-full"
          />
        </div>
      )}
    </div>
  )
}

function ContinuousView({ renderedPages, totalPages }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <>
      {pages.map((pageNumber) => {
        const pageData = renderedPages.get(pageNumber)
        
        return (
          <div 
            key={pageNumber} 
            className="bg-white shadow-lg rounded-lg overflow-hidden mb-4"
            data-page-number={pageNumber}
          >
            {pageData ? (
              <canvas
                ref={(canvas) => {
                  if (canvas && pageData.canvas) {
                    const ctx = canvas.getContext('2d')
                    canvas.width = pageData.canvas.width
                    canvas.height = pageData.canvas.height
                    ctx.drawImage(pageData.canvas, 0, 0)
                  }
                }}
                className="max-w-full"
              />
            ) : (
              <div className="flex items-center justify-center h-96 bg-secondary-50">
                <div className="text-center">
                  <Spinner className="mb-2" />
                  <p className="text-sm text-secondary-500">Loading page {pageNumber}...</p>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}
