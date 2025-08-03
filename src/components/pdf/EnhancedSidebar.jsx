import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Bookmark, 
  MessageSquare, 
  Search, 
  Layers,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  MoreHorizontal,
  Filter,
  SortAsc,
  X,
  Plus
} from 'lucide-react';
import { Button, Input, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../ui';
import { usePDFStore } from '../../stores';
import { cn } from '../../utils';
import { format } from 'date-fns';

const SIDEBAR_TABS = [
  { id: 'thumbnails', label: 'Pages', icon: FileText },
  { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  { id: 'annotations', label: 'Annotations', icon: MessageSquare },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'layers', label: 'Layers', icon: Layers }
];

const ANNOTATION_TYPES = {
  text: { label: 'Text', color: 'bg-blue-400' },
  highlight: { label: 'Highlight', color: 'bg-yellow-400' },
  note: { label: 'Note', color: 'bg-orange-400' },
  pen: { label: 'Drawing', color: 'bg-green-400' },
  rectangle: { label: 'Rectangle', color: 'bg-purple-400' },
  circle: { label: 'Circle', color: 'bg-pink-400' },
  arrow: { label: 'Arrow', color: 'bg-red-400' }
};

export function EnhancedSidebar({ className, isOpen = true, onToggle }) {
  const { 
    totalPages,
    currentPage,
    bookmarks,
    annotations,
    searchResults,
    layers,
    setCurrentPage,
    searchInDocument,
    toggleBookmark,
    deleteAnnotation,
    toggleAnnotationVisibility,
    toggleLayerVisibility,
    addBookmark
  } = usePDFStore();

  const [activeTab, setActiveTab] = useState('thumbnails');
  const [searchQuery, setSearchQuery] = useState('');
  const [annotationFilter, setAnnotationFilter] = useState('all');
  const [expandedBookmarks, setExpandedBookmarks] = useState(new Set());

  // Generate page thumbnails data
  const pages = useMemo(() => {
    return Array.from({ length: totalPages || 0 }, (_, i) => ({
      pageNumber: i + 1,
      thumbnail: null, // Would be generated from PDF page
      isBookmarked: bookmarks?.some(b => b.pageNumber === i + 1) || false
    }));
  }, [totalPages, bookmarks]);

  // Filter annotations
  const filteredAnnotations = useMemo(() => {
    if (!annotations) return [];
    
    if (annotationFilter === 'all') return annotations;
    return annotations.filter(annotation => annotation.type === annotationFilter);
  }, [annotations, annotationFilter]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchInDocument?.(query);
    }
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleBookmarkToggle = (pageNumber) => {
    if (toggleBookmark) {
      toggleBookmark(pageNumber);
    } else if (addBookmark) {
      addBookmark({ pageNumber, title: `Page ${pageNumber}` });
    }
  };

  const toggleBookmarkExpansion = (bookmarkId) => {
    setExpandedBookmarks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookmarkId)) {
        newSet.delete(bookmarkId);
      } else {
        newSet.add(bookmarkId);
      }
      return newSet;
    });
  };

  const renderThumbnailsTab = () => (
    <div className="space-y-2">
      {pages.map((page) => (
        <div
          key={page.pageNumber}
          className={cn(
            'relative group cursor-pointer rounded-lg border-2 transition-all hover:border-primary-300',
            currentPage === page.pageNumber 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-200 hover:border-gray-300'
          )}
          onClick={() => handlePageClick(page.pageNumber)}
        >
          <div className="aspect-[3/4] bg-white rounded-lg overflow-hidden">
            {/* Thumbnail placeholder */}
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <span className="text-sm text-gray-600">{page.pageNumber}</span>
              </div>
            </div>
          </div>
          
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleBookmarkToggle(page.pageNumber);
              }}
              className={cn(
                'h-6 w-6 p-0 bg-white shadow-sm',
                page.isBookmarked && 'text-yellow-500'
              )}
            >
              <Bookmark className="h-3 w-3" fill={page.isBookmarked ? 'currentColor' : 'none'} />
            </Button>
          </div>
          
          <div className="p-2 text-center">
            <span className="text-xs text-gray-600">Page {page.pageNumber}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderBookmarksTab = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Bookmarks</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleBookmarkToggle(currentPage)}
          className="h-6 w-6 p-0"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      
      {!bookmarks || bookmarks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Bookmark className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No bookmarks yet</p>
          <p className="text-xs text-gray-400">Click the bookmark icon on pages to add them</p>
        </div>
      ) : (
        bookmarks.map((bookmark) => (
          <div key={bookmark.id || bookmark.pageNumber} className="group">
            <div className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              {bookmark.children && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleBookmarkExpansion(bookmark.id || bookmark.pageNumber)}
                  className="h-4 w-4 p-0 mr-2"
                >
                  {expandedBookmarks.has(bookmark.id || bookmark.pageNumber) ? 
                    <ChevronDown className="h-3 w-3" /> : 
                    <ChevronRight className="h-3 w-3" />
                  }
                </Button>
              )}
              
              <div className="flex-1 min-w-0" onClick={() => handlePageClick(bookmark.pageNumber)}>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {bookmark.title || `Page ${bookmark.pageNumber}`}
                </p>
                <p className="text-xs text-gray-500">Page {bookmark.pageNumber}</p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBookmarkToggle(bookmark.pageNumber)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {expandedBookmarks.has(bookmark.id || bookmark.pageNumber) && bookmark.children && (
              <div className="ml-4 space-y-1">
                {bookmark.children.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handlePageClick(child.pageNumber)}
                  >
                    <div className="w-4" />
                    <p className="text-sm text-gray-700 truncate">{child.title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  const renderAnnotationsTab = () => (
    <div className="space-y-3">
      {/* Filter Controls */}
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="h-3 w-3 mr-1" />
              {annotationFilter === 'all' ? 'All' : ANNOTATION_TYPES[annotationFilter]?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setAnnotationFilter('all')}>
              All Types
            </DropdownMenuItem>
            {Object.entries(ANNOTATION_TYPES).map(([type, config]) => (
              <DropdownMenuItem key={type} onClick={() => setAnnotationFilter(type)}>
                <div className={`h-3 w-3 rounded mr-2 ${config.color}`} />
                {config.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button variant="outline" size="sm" className="h-8">
          <SortAsc className="h-3 w-3" />
        </Button>
      </div>

      {/* Annotations List */}
      <div className="space-y-2">
        {!filteredAnnotations || filteredAnnotations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No annotations yet</p>
            <p className="text-xs text-gray-400">Start annotating to see them here</p>
          </div>
        ) : (
          filteredAnnotations.map((annotation) => (
            <div
              key={annotation.id}
              className="group p-3 bg-white rounded-lg border hover:shadow-sm cursor-pointer"
              onClick={() => handlePageClick(annotation.pageNumber)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`h-2 w-2 rounded ${ANNOTATION_TYPES[annotation.type]?.color || 'bg-gray-400'}`} />
                    <span className="text-xs text-gray-500">
                      {ANNOTATION_TYPES[annotation.type]?.label || annotation.type}
                    </span>
                    <span className="text-xs text-gray-400">Page {annotation.pageNumber}</span>
                  </div>
                  
                  <p className="text-sm text-gray-900 truncate">
                    {annotation.content || 'No content'}
                  </p>
                  
                  {annotation.author && (
                    <p className="text-xs text-gray-500 mt-1">
                      by {annotation.author} • {annotation.createdAt ? format(new Date(annotation.createdAt), 'MMM d, HH:mm') : 'Now'}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAnnotationVisibility?.(annotation.id);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    {annotation.visible !== false ? 
                      <Eye className="h-3 w-3" /> : 
                      <EyeOff className="h-3 w-3" />
                    }
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAnnotation?.(annotation.id);
                    }}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderSearchTab = () => (
    <div className="space-y-3">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search in document..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pr-8"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSearch('')}
            className="absolute right-1 top-1 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {searchResults && searchResults.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
          </p>
          
          {searchResults.map((result, index) => (
            <div
              key={index}
              className="p-3 bg-white rounded-lg border hover:shadow-sm cursor-pointer"
              onClick={() => handlePageClick(result.pageNumber)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Page {result.pageNumber}</span>
              </div>
              <p className="text-sm text-gray-900">{result.snippet}</p>
            </div>
          ))}
        </div>
      )}
      
      {searchQuery && (!searchResults || searchResults.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No results found</p>
          <p className="text-xs text-gray-400">Try different search terms</p>
        </div>
      )}
    </div>
  );

  const renderLayersTab = () => (
    <div className="space-y-2">
      {!layers || layers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Layers className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No layers</p>
        </div>
      ) : (
        layers.map((layer) => (
          <div key={layer.id} className="flex items-center p-2 rounded-lg hover:bg-gray-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleLayerVisibility?.(layer.id)}
              className="h-6 w-6 p-0 mr-2"
            >
              {layer.visible !== false ? 
                <Eye className="h-3 w-3" /> : 
                <EyeOff className="h-3 w-3" />
              }
            </Button>
            
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{layer.name}</p>
              <p className="text-xs text-gray-500">{layer.type}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'thumbnails':
        return renderThumbnailsTab();
      case 'bookmarks':
        return renderBookmarksTab();
      case 'annotations':
        return renderAnnotationsTab();
      case 'search':
        return renderSearchTab();
      case 'layers':
        return renderLayersTab();
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <TooltipProvider>
      <div className={cn('w-80 bg-gray-50 border-r border-gray-200 flex flex-col', className)}>
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-white">
          {SIDEBAR_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex-1 h-12 rounded-none border-b-2 border-transparent',
                      isActive && 'border-primary-500'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tab.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {renderTabContent()}
        </div>
      </div>
    </TooltipProvider>
  );
}
