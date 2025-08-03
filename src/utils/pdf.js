import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

// PDF loading and parsing utilities
export class PDFService {
  static async loadPDF(file) {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      return {
        pdf,
        numPages: pdf.numPages,
        fingerprint: pdf.fingerprint
      }
    } catch (error) {
      throw new Error(`Failed to load PDF: ${error.message}`)
    }
  }

  static async loadPDFFromUrl(url) {
    try {
      const pdf = await pdfjsLib.getDocument(url).promise
      
      return {
        pdf,
        numPages: pdf.numPages,
        fingerprint: pdf.fingerprint
      }
    } catch (error) {
      throw new Error(`Failed to load PDF from URL: ${error.message}`)
    }
  }

  static async renderPage(pdf, pageNumber, scale = 1.0, rotation = 0) {
    try {
      const page = await pdf.getPage(pageNumber)
      const viewport = page.getViewport({ scale, rotation })
      
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      
      canvas.height = viewport.height
      canvas.width = viewport.width
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }
      
      await page.render(renderContext).promise
      
      return {
        canvas,
        viewport,
        page
      }
    } catch (error) {
      throw new Error(`Failed to render page ${pageNumber}: ${error.message}`)
    }
  }

  static async getPageText(pdf, pageNumber) {
    try {
      const page = await pdf.getPage(pageNumber)
      const textContent = await page.getTextContent()
      
      return textContent.items.map(item => item.str).join(' ')
    } catch (error) {
      throw new Error(`Failed to extract text from page ${pageNumber}: ${error.message}`)
    }
  }

  static async searchText(pdf, searchTerm, pageNumber = null) {
    try {
      const results = []
      const startPage = pageNumber || 1
      const endPage = pageNumber || pdf.numPages

      for (let i = startPage; i <= endPage; i++) {
        const text = await this.getPageText(pdf, i)
        const regex = new RegExp(searchTerm, 'gi')
        const matches = [...text.matchAll(regex)]
        
        matches.forEach(match => {
          results.push({
            page: i,
            text: match[0],
            index: match.index,
            context: text.substring(
              Math.max(0, match.index - 50),
              Math.min(text.length, match.index + match[0].length + 50)
            )
          })
        })
      }

      return results
    } catch (error) {
      throw new Error(`Failed to search text: ${error.message}`)
    }
  }

  static async extractMetadata(pdf) {
    try {
      const metadata = await pdf.getMetadata()
      
      return {
        title: metadata.info?.Title || 'Untitled',
        author: metadata.info?.Author || 'Unknown',
        subject: metadata.info?.Subject || '',
        creator: metadata.info?.Creator || '',
        producer: metadata.info?.Producer || '',
        creationDate: metadata.info?.CreationDate || null,
        modificationDate: metadata.info?.ModDate || null,
        keywords: metadata.info?.Keywords || '',
        pages: pdf.numPages
      }
    } catch (error) {
      throw new Error(`Failed to extract metadata: ${error.message}`)
    }
  }
}

// PDF editing utilities using pdf-lib
export class PDFEditor {
  static async createNewPDF() {
    return await PDFDocument.create()
  }

  static async loadPDFForEditing(arrayBuffer) {
    return await PDFDocument.load(arrayBuffer)
  }

  static async addPage(pdfDoc, width = 612, height = 792) {
    return pdfDoc.addPage([width, height])
  }

  static async deletePage(pdfDoc, pageIndex) {
    pdfDoc.removePage(pageIndex)
  }

  static async rotatePage(pdfDoc, pageIndex, degrees) {
    const pages = pdfDoc.getPages()
    const page = pages[pageIndex]
    page.setRotation({ angle: degrees })
  }

  static async addText(pdfDoc, pageIndex, text, x, y, options = {}) {
    const pages = pdfDoc.getPages()
    const page = pages[pageIndex]
    
    const font = await pdfDoc.embedFont(options.font || StandardFonts.Helvetica)
    
    page.drawText(text, {
      x,
      y,
      size: options.size || 12,
      font,
      color: options.color || rgb(0, 0, 0),
      ...options
    })
  }

  static async addImage(pdfDoc, pageIndex, imageBuffer, x, y, options = {}) {
    const pages = pdfDoc.getPages()
    const page = pages[pageIndex]
    
    // Detect image type and embed accordingly
    const image = imageBuffer.type?.includes('png') 
      ? await pdfDoc.embedPng(imageBuffer)
      : await pdfDoc.embedJpg(imageBuffer)
    
    page.drawImage(image, {
      x,
      y,
      width: options.width || image.width,
      height: options.height || image.height,
      ...options
    })
  }

  static async mergePDFs(pdfDocs) {
    const mergedPdf = await PDFDocument.create()
    
    for (const pdfDoc of pdfDocs) {
      const pageIndices = pdfDoc.getPageIndices()
      const pages = await mergedPdf.copyPages(pdfDoc, pageIndices)
      pages.forEach(page => mergedPdf.addPage(page))
    }
    
    return mergedPdf
  }

  static async splitPDF(pdfDoc, pageRanges) {
    const splitPdfs = []
    
    for (const range of pageRanges) {
      const newPdf = await PDFDocument.create()
      const pages = await newPdf.copyPages(pdfDoc, range)
      pages.forEach(page => newPdf.addPage(page))
      splitPdfs.push(newPdf)
    }
    
    return splitPdfs
  }

  static async savePDF(pdfDoc) {
    return await pdfDoc.save()
  }

  static async addWatermark(pdfDoc, text, options = {}) {
    const pages = pdfDoc.getPages()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    
    pages.forEach(page => {
      const { width, height } = page.getSize()
      
      page.drawText(text, {
        x: width / 2,
        y: height / 2,
        size: options.size || 50,
        font,
        color: options.color || rgb(0.8, 0.8, 0.8),
        opacity: options.opacity || 0.3,
        rotate: { angle: options.angle || -45 },
        ...options
      })
    })
  }

  static async addPageNumbers(pdfDoc, options = {}) {
    const pages = pdfDoc.getPages()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    
    pages.forEach((page, index) => {
      const { width, height } = page.getSize()
      const pageNumber = (index + 1).toString()
      
      page.drawText(pageNumber, {
        x: options.position === 'left' ? 50 : width - 50,
        y: options.position === 'top' ? height - 50 : 50,
        size: options.size || 12,
        font,
        color: options.color || rgb(0, 0, 0),
        ...options
      })
    })
  }
}

// Annotation utilities
export class AnnotationManager {
  static createHighlight(x, y, width, height, color = '#ffff00', opacity = 0.3) {
    return {
      type: 'highlight',
      x,
      y,
      width,
      height,
      color,
      opacity,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    }
  }

  static createTextAnnotation(x, y, text, options = {}) {
    return {
      type: 'text',
      x,
      y,
      text,
      fontSize: options.fontSize || 12,
      fontFamily: options.fontFamily || 'Arial',
      color: options.color || '#000000',
      id: this.generateId(),
      createdAt: new Date().toISOString()
    }
  }

  static createDrawing(path, color = '#000000', strokeWidth = 2) {
    return {
      type: 'drawing',
      path,
      color,
      strokeWidth,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    }
  }

  static createShape(type, x, y, width, height, options = {}) {
    return {
      type: 'shape',
      shapeType: type, // 'rectangle', 'circle', 'arrow'
      x,
      y,
      width,
      height,
      strokeColor: options.strokeColor || '#000000',
      fillColor: options.fillColor || 'transparent',
      strokeWidth: options.strokeWidth || 2,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    }
  }

  static createStickyNote(x, y, text, color = '#ffeb3b') {
    return {
      type: 'stickyNote',
      x,
      y,
      text,
      color,
      width: 200,
      height: 150,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    }
  }

  static generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  static exportAnnotations(annotations) {
    return JSON.stringify(annotations, null, 2)
  }

  static importAnnotations(jsonString) {
    try {
      return JSON.parse(jsonString)
    } catch (error) {
      throw new Error('Invalid annotation format')
    }
  }
}

// Form field utilities
export class FormFieldManager {
  static createTextField(x, y, width, height, name, options = {}) {
    return {
      type: 'textField',
      x,
      y,
      width,
      height,
      name,
      value: options.value || '',
      placeholder: options.placeholder || '',
      required: options.required || false,
      multiline: options.multiline || false,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    }
  }

  static createCheckbox(x, y, size, name, options = {}) {
    return {
      type: 'checkbox',
      x,
      y,
      width: size,
      height: size,
      name,
      checked: options.checked || false,
      required: options.required || false,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    }
  }

  static createRadioButton(x, y, size, name, value, options = {}) {
    return {
      type: 'radioButton',
      x,
      y,
      width: size,
      height: size,
      name,
      value,
      selected: options.selected || false,
      required: options.required || false,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    }
  }

  static createDropdown(x, y, width, height, name, options = {}) {
    return {
      type: 'dropdown',
      x,
      y,
      width,
      height,
      name,
      options: options.options || [],
      selectedValue: options.selectedValue || '',
      required: options.required || false,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    }
  }

  static generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }
}

// Export utilities
export class ExportManager {
  static async exportToPNG(canvas, quality = 0.95) {
    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png', quality)
    })
  }

  static async exportToJPEG(canvas, quality = 0.95) {
    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', quality)
    })
  }

  static async exportToDataURL(canvas, format = 'png', quality = 0.95) {
    return canvas.toDataURL(`image/${format}`, quality)
  }
}
