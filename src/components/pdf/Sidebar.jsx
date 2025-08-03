import { useState } from 'react'
import { 
  FileText, 
  Bookmark, 
  MessageSquare, 
  X, 
  ChevronLeft,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react'
import { usePDFStore } from '../../stores'
import { Button, Input, Card } from '../ui'
import { cn } from '../../utils'

export function Sidebar({ className }) {
  const {
    sidebarOpen,
    sidebarTab,
    documentPages,
    currentPage,
    annotations,
    setSidebarOpen,
    setSidebarTab,
    setCurrentPage
  } = usePDFStore()

  if (!sidebarOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-20 z-40 bg-white shadow-md hover:shadow-lg"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    )
  }

  const tabs = [
    { id: 'thumbnails', icon: FileText, label: 'Pages' },
    { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks' },
    { id: 'annotations', icon: MessageSquare, label: 'Comments' }
  ]

  return (
    <div className={cn(
      'w-80 bg-white border-r border-secondary-200 flex flex-col shadow-sm',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-secondary-200">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                variant={sidebarTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSidebarTab(tab.id)}
                className="flex items-center space-x-2"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </Button>
            )
          })}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {sidebarTab === 'thumbnails' && (
          <ThumbnailsPanel 
            pages={documentPages}
            currentPage={currentPage}
            onPageSelect={setCurrentPage}
          />
        )}
        
        {sidebarTab === 'bookmarks' && (
          <BookmarksPanel />
        )}
        
        {sidebarTab === 'annotations' && (
          <AnnotationsPanel annotations={annotations} />
        )}
      </div>
    </div>
  )
}

function ThumbnailsPanel({ pages, currentPage, onPageSelect }) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPages = pages.filter((page) =>
    page.toString().includes(searchTerm)
  )

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-4 border-b border-secondary-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
          <Input
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Page Thumbnails */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredPages.map((page) => (
            <ThumbnailCard
              key={page}
              pageNumber={page}
              isSelected={page === currentPage}
              onSelect={onPageSelect}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ThumbnailCard({ pageNumber, isSelected, onSelect }) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isSelected && 'ring-2 ring-primary-500 shadow-md'
      )}
      onClick={() => onSelect(pageNumber)}
    >
      <div className="aspect-[3/4] bg-secondary-50 rounded-t-lg flex items-center justify-center">
        {/* Placeholder for thumbnail */}
        <div className="text-center">
          <FileText className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
          <span className="text-xs text-secondary-500">Page {pageNumber}</span>
        </div>
      </div>
      <div className="p-2 text-center">
        <span className="text-sm font-medium">{pageNumber}</span>
      </div>
    </Card>
  )
}

function BookmarksPanel() {
  const [bookmarks] = useState([
    { id: 1, title: 'Introduction', page: 1 },
    { id: 2, title: 'Chapter 1: Overview', page: 5 },
    { id: 3, title: 'Chapter 2: Implementation', page: 15 },
    { id: 4, title: 'Conclusion', page: 25 }
  ])

  const { setCurrentPage } = usePDFStore()

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-secondary-200">
        <h3 className="font-medium text-secondary-900">Bookmarks</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-secondary-500">
            <Bookmark className="h-12 w-12 mb-4" />
            <p className="text-sm">No bookmarks found</p>
          </div>
        ) : (
          <div className="p-2">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="flex items-center justify-between p-3 hover:bg-secondary-50 rounded-lg cursor-pointer group"
                onClick={() => setCurrentPage(bookmark.page)}
              >
                <div className="flex items-center space-x-3">
                  <Bookmark className="h-4 w-4 text-primary-500" />
                  <div>
                    <p className="text-sm font-medium text-secondary-900 group-hover:text-primary-600">
                      {bookmark.title}
                    </p>
                    <p className="text-xs text-secondary-500">
                      Page {bookmark.page}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-secondary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AnnotationsPanel({ annotations }) {
  const [filter, setFilter] = useState('all')
  const { setCurrentPage } = usePDFStore()

  const filteredAnnotations = annotations.filter((annotation) => {
    if (filter === 'all') return true
    return annotation.type === filter
  })

  const annotationTypes = [
    { value: 'all', label: 'All' },
    { value: 'highlight', label: 'Highlights' },
    { value: 'text', label: 'Text' },
    { value: 'drawing', label: 'Drawings' },
    { value: 'stickyNote', label: 'Notes' }
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-secondary-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-secondary-900">Comments</h3>
          <Button variant="ghost" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-3 py-1 text-sm border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {annotationTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredAnnotations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-secondary-500">
            <MessageSquare className="h-12 w-12 mb-4" />
            <p className="text-sm text-center px-4">
              {filter === 'all' ? 'No annotations yet' : `No ${filter} annotations`}
            </p>
          </div>
        ) : (
          <div className="p-2">
            {filteredAnnotations.map((annotation) => (
              <AnnotationCard
                key={annotation.id}
                annotation={annotation}
                onNavigate={setCurrentPage}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AnnotationCard({ annotation, onNavigate }) {
  const getTypeColor = (type) => {
    switch (type) {
      case 'highlight': return 'bg-yellow-100 text-yellow-800'
      case 'text': return 'bg-blue-100 text-blue-800'
      case 'drawing': return 'bg-green-100 text-green-800'
      case 'stickyNote': return 'bg-orange-100 text-orange-800'
      default: return 'bg-secondary-100 text-secondary-800'
    }
  }

  return (
    <Card className="p-3 mb-3 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={cn(
              'px-2 py-1 text-xs font-medium rounded-full',
              getTypeColor(annotation.type)
            )}>
              {annotation.type}
            </span>
            <span className="text-xs text-secondary-500">
              Page {annotation.page || 1}
            </span>
          </div>
          
          {annotation.text && (
            <p className="text-sm text-secondary-700 mb-2">
              {annotation.text}
            </p>
          )}
          
          <p className="text-xs text-secondary-500">
            {new Date(annotation.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate(annotation.page || 1)}
        >
          Go to
        </Button>
      </div>
    </Card>
  )
}
