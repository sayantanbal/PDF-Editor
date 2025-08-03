import { useState, useCallback } from 'react'
import { usePDFStore } from '../stores'
import { PDFService } from '../utils/pdf'
import toast from 'react-hot-toast'

export function usePDFManager() {
  const [isProcessing, setIsProcessing] = useState(false)
  const { 
    currentDocument, 
    setDocument, 
    setError, 
    setLoading,
    resetDocument 
  } = usePDFStore()

  const loadPDF = useCallback(async (file) => {
    if (!file) return null

    setIsProcessing(true)
    setLoading(true)
    setError(null)

    try {
      const pdfData = await PDFService.loadPDF(file)
      setDocument(file)
      
      toast.success('PDF loaded successfully')
      return pdfData
    } catch (error) {
      const errorMessage = error.message || 'Failed to load PDF'
      setError(errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      setIsProcessing(false)
      setLoading(false)
    }
  }, [setDocument, setError, setLoading])

  const unloadPDF = useCallback(() => {
    resetDocument()
    toast.success('PDF closed')
  }, [resetDocument])

  const searchInPDF = useCallback(async (searchTerm, pageNumber = null) => {
    if (!currentDocument || !searchTerm.trim()) return []

    setIsProcessing(true)
    
    try {
      const pdfData = await PDFService.loadPDF(currentDocument)
      const results = await PDFService.searchText(pdfData.pdf, searchTerm.trim(), pageNumber)
      
      toast.success(`Found ${results.length} results`)
      return results
    } catch (error) {
      const errorMessage = 'Failed to search in PDF'
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }, [currentDocument])

  const extractTextFromPage = useCallback(async (pageNumber) => {
    if (!currentDocument) return ''

    setIsProcessing(true)
    
    try {
      const pdfData = await PDFService.loadPDF(currentDocument)
      const text = await PDFService.getPageText(pdfData.pdf, pageNumber)
      
      return text
    } catch (error) {
      const errorMessage = `Failed to extract text from page ${pageNumber}`
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }, [currentDocument])

  const getMetadata = useCallback(async () => {
    if (!currentDocument) return null

    setIsProcessing(true)
    
    try {
      const pdfData = await PDFService.loadPDF(currentDocument)
      const metadata = await PDFService.extractMetadata(pdfData.pdf)
      
      return metadata
    } catch (error) {
      const errorMessage = 'Failed to extract metadata'
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }, [currentDocument])

  return {
    // State
    isProcessing,
    currentDocument,
    
    // Actions
    loadPDF,
    unloadPDF,
    searchInPDF,
    extractTextFromPage,
    getMetadata
  }
}

export function useAnnotations() {
  const { annotations, addAnnotation, updateAnnotation, deleteAnnotation } = usePDFStore()
  const [isCreating, setIsCreating] = useState(false)

  const createHighlight = useCallback(async (selection) => {
    setIsCreating(true)
    
    try {
      const annotation = {
        type: 'highlight',
        page: selection.pageNumber,
        x: selection.x,
        y: selection.y,
        width: selection.width,
        height: selection.height,
        color: '#ffff00',
        opacity: 0.3,
        text: selection.text,
        createdAt: new Date().toISOString()
      }
      
      addAnnotation(annotation)
      toast.success('Highlight added')
      
      return annotation
    } catch (error) {
      toast.error('Failed to create highlight')
      throw error
    } finally {
      setIsCreating(false)
    }
  }, [addAnnotation])

  const createTextNote = useCallback(async (position, text) => {
    setIsCreating(true)
    
    try {
      const annotation = {
        type: 'stickyNote',
        page: position.pageNumber,
        x: position.x,
        y: position.y,
        text: text,
        color: '#ffeb3b',
        width: 200,
        height: 150,
        createdAt: new Date().toISOString()
      }
      
      addAnnotation(annotation)
      toast.success('Note added')
      
      return annotation
    } catch (error) {
      toast.error('Failed to create note')
      throw error
    } finally {
      setIsCreating(false)
    }
  }, [addAnnotation])

  const editAnnotation = useCallback(async (id, updates) => {
    try {
      updateAnnotation(id, { ...updates, modifiedAt: new Date().toISOString() })
      toast.success('Annotation updated')
    } catch (error) {
      toast.error('Failed to update annotation')
      throw error
    }
  }, [updateAnnotation])

  const removeAnnotation = useCallback(async (id) => {
    try {
      deleteAnnotation(id)
      toast.success('Annotation removed')
    } catch (error) {
      toast.error('Failed to remove annotation')
      throw error
    }
  }, [deleteAnnotation])

  return {
    // State
    annotations,
    isCreating,
    
    // Actions
    createHighlight,
    createTextNote,
    editAnnotation,
    removeAnnotation
  }
}

export function useKeyboardShortcuts() {
  const {
    nextPage,
    previousPage,
    zoomIn,
    zoomOut,
    resetZoom,
    setSelectedTool
  } = usePDFStore()

  const handleKeyDown = useCallback((event) => {
    // Don't trigger shortcuts when typing in input fields
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return
    }

    const { key, ctrlKey, metaKey, shiftKey } = event
    const isCtrlOrCmd = ctrlKey || metaKey

    switch (key) {
      case 'ArrowRight':
      case 'PageDown':
        event.preventDefault()
        nextPage()
        break
        
      case 'ArrowLeft':
      case 'PageUp':
        event.preventDefault()
        previousPage()
        break
        
      case '=':
      case '+':
        if (isCtrlOrCmd) {
          event.preventDefault()
          zoomIn()
        }
        break
        
      case '-':
        if (isCtrlOrCmd) {
          event.preventDefault()
          zoomOut()
        }
        break
        
      case '0':
        if (isCtrlOrCmd) {
          event.preventDefault()
          resetZoom()
        }
        break
        
      case 'v':
        if (!isCtrlOrCmd) {
          setSelectedTool('select')
        }
        break
        
      case 't':
        if (!isCtrlOrCmd) {
          setSelectedTool('text')
        }
        break
        
      case 'h':
        if (!isCtrlOrCmd) {
          setSelectedTool('highlight')
        }
        break
        
      case 'd':
        if (!isCtrlOrCmd) {
          setSelectedTool('draw')
        }
        break
        
      case 's':
        if (!isCtrlOrCmd) {
          setSelectedTool('shape')
        }
        break
        
      default:
        break
    }
  }, [nextPage, previousPage, zoomIn, zoomOut, resetZoom, setSelectedTool])

  return {
    handleKeyDown
  }
}
