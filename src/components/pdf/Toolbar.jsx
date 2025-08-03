import { 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  RotateCw, 
  Download, 
  Printer,
  Search,
  Edit3,
  Highlighter,
  Square,
  Type,
  MousePointer,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Grid3X3
} from 'lucide-react'
import { usePDFStore } from '../../stores'
import { Button, Input, Select } from '../ui'
import { cn } from '../../utils'

export function Toolbar({ className }) {
  const {
    currentPage,
    totalPages,
    scale,
    rotation,
    viewMode,
    selectedTool,
    setCurrentPage,
    setScale,
    setRotation,
    setViewMode,
    setSelectedTool,
    nextPage,
    previousPage,
    zoomIn,
    zoomOut,
    resetZoom
  } = usePDFStore()

  const handlePageChange = (e) => {
    const page = parseInt(e.target.value)
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleScaleChange = (e) => {
    const newScale = parseFloat(e.target.value)
    setScale(newScale)
  }

  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'highlight', icon: Highlighter, label: 'Highlight' },
    { id: 'draw', icon: Edit3, label: 'Draw' },
    { id: 'shape', icon: Square, label: 'Shapes' }
  ]

  return (
    <div className={cn(
      'flex items-center justify-between bg-white border-b border-secondary-200 px-4 py-2 shadow-sm',
      className
    )}>
      {/* Left Section - Tools */}
      <div className="flex items-center space-x-2">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <Button
              key={tool.id}
              variant={selectedTool === tool.id ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setSelectedTool(tool.id)}
              title={tool.label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          )
        })}
        
        <div className="h-6 w-px bg-secondary-200 mx-2" />
        
        <Button variant="ghost" size="icon" title="Search">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Center Section - Navigation & View Controls */}
      <div className="flex items-center space-x-4">
        {/* Page Navigation */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={previousPage}
            disabled={currentPage <= 1}
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-1">
            <Input
              type="number"
              value={currentPage}
              onChange={handlePageChange}
              className="w-16 text-center"
              min={1}
              max={totalPages}
            />
            <span className="text-sm text-secondary-500">
              of {totalPages}
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={nextPage}
            disabled={currentPage >= totalPages}
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-secondary-200" />

        {/* Zoom Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomOut}
            disabled={scale <= 0.1}
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <Select
            value={scale.toString()}
            onChange={handleScaleChange}
            className="w-24"
          >
            <option value="0.25">25%</option>
            <option value="0.5">50%</option>
            <option value="0.75">75%</option>
            <option value="1">100%</option>
            <option value="1.25">125%</option>
            <option value="1.5">150%</option>
            <option value="2">200%</option>
            <option value="3">300%</option>
            <option value="4">400%</option>
            <option value="5">500%</option>
          </Select>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomIn}
            disabled={scale >= 5}
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={resetZoom}
            title="Reset zoom"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-secondary-200" />

        {/* Rotation Controls */}
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRotation(rotation - 90)}
            title="Rotate left"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRotation(rotation + 90)}
            title="Rotate right"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-secondary-200" />

        {/* View Mode Controls */}
        <div className="flex items-center space-x-1">
          <Button
            variant={viewMode === 'single' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('single')}
            title="Single page"
          >
            <FileText className="h-4 w-4" />
          </Button>
          
          <Button
            variant={viewMode === 'continuous' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('continuous')}
            title="Continuous scroll"
          >
            <Minimize className="h-4 w-4" />
          </Button>
          
          <Button
            variant={viewMode === 'facing' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('facing')}
            title="Facing pages"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" title="Print">
          <Printer className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="icon" title="Download">
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function MobileToolbar({ className }) {
  const {
    currentPage,
    totalPages,
    selectedTool,
    setSelectedTool,
    nextPage,
    previousPage,
    zoomIn,
    zoomOut
  } = usePDFStore()

  const tools = [
    { id: 'select', icon: MousePointer },
    { id: 'text', icon: Type },
    { id: 'highlight', icon: Highlighter },
    { id: 'draw', icon: Edit3 }
  ]

  return (
    <div className={cn(
      'flex items-center justify-between bg-white border-t border-secondary-200 px-4 py-2 shadow-sm',
      className
    )}>
      {/* Tool Selection */}
      <div className="flex items-center space-x-1">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <Button
              key={tool.id}
              variant={selectedTool === tool.id ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setSelectedTool(tool.id)}
            >
              <Icon className="h-4 w-4" />
            </Button>
          )
        })}
      </div>

      {/* Page Navigation */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={previousPage}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="text-sm font-medium">
          {currentPage} / {totalPages}
        </span>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={nextPage}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="icon" onClick={zoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="icon" onClick={zoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
