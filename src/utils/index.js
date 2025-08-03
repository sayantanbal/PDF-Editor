import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility function to merge Tailwind classes
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Format file size
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Format date
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// Generate unique ID
export function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Download file
export function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Validate file type
export function validateFileType(file, allowedTypes = ['.pdf']) {
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
  return allowedTypes.includes(fileExtension)
}

// Validate file size (in bytes)
export function validateFileSize(file, maxSize = 100 * 1024 * 1024) { // 100MB default
  return file.size <= maxSize
}

// Debounce function
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle function
export function throttle(func, limit) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Check if device is mobile
export function isMobile() {
  return window.innerWidth < 768
}

// Check if device is tablet
export function isTablet() {
  return window.innerWidth >= 768 && window.innerWidth < 1024
}

// Get viewport dimensions
export function getViewportDimensions() {
  return {
    width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
    height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
  }
}

// Convert degrees to radians
export function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180)
}

// Convert radians to degrees
export function radiansToDegrees(radians) {
  return radians * (180 / Math.PI)
}

// Calculate distance between two points
export function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

// Get random color
export function getRandomColor() {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// Check if point is inside rectangle
export function isPointInRectangle(x, y, rect) {
  return x >= rect.x && 
         x <= rect.x + rect.width && 
         y >= rect.y && 
         y <= rect.y + rect.height
}

// Local storage helpers
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },
  
  remove: (key) => {
    localStorage.removeItem(key)
  },
  
  clear: () => {
    localStorage.clear()
  }
}

// Session storage helpers
export const sessionStorage = {
  get: (key) => {
    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },
  
  set: (key, value) => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },
  
  remove: (key) => {
    window.sessionStorage.removeItem(key)
  },
  
  clear: () => {
    window.sessionStorage.clear()
  }
}
