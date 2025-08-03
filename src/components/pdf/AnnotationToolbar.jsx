import React, { useState } from 'react';
import { 
  MousePointer, 
  Type, 
  Highlighter, 
  Square, 
  Circle, 
  ArrowRight, 
  Pen, 
  Eraser,
  Sticky,
  Image,
  Stamp,
  Save,
  Undo,
  Redo,
  Settings,
  MoreHorizontal,
  Palette
} from 'lucide-react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../ui';
import { usePDFStore } from '../../stores';
import { cn } from '../../utils';

const ANNOTATION_TOOLS = [
  {
    id: 'select',
    icon: MousePointer,
    label: 'Select',
    shortcut: 'V',
    primary: true
  },
  {
    id: 'text',
    icon: Type,
    label: 'Add Text',
    shortcut: 'T',
    primary: true
  },
  {
    id: 'highlight',
    icon: Highlighter,
    label: 'Highlight',
    shortcut: 'H',
    primary: true
  },
  {
    id: 'note',
    icon: Sticky,
    label: 'Sticky Note',
    shortcut: 'N',
    primary: true
  },
  {
    id: 'pen',
    icon: Pen,
    label: 'Pen Tool',
    shortcut: 'P',
    primary: true
  },
  {
    id: 'rectangle',
    icon: Square,
    label: 'Rectangle',
    shortcut: 'R'
  },
  {
    id: 'circle',
    icon: Circle,
    label: 'Circle',
    shortcut: 'C'
  },
  {
    id: 'arrow',
    icon: ArrowRight,
    label: 'Arrow',
    shortcut: 'A'
  },
  {
    id: 'eraser',
    icon: Eraser,
    label: 'Eraser',
    shortcut: 'E'
  },
  {
    id: 'image',
    icon: Image,
    label: 'Insert Image',
    shortcut: 'I'
  },
  {
    id: 'stamp',
    icon: Stamp,
    label: 'Stamp',
    shortcut: 'S'
  }
];

const COLOR_PALETTE = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Black', value: '#000000' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'White', value: '#ffffff' }
];

export function AnnotationToolbar({ className }) {
  const { 
    selectedTool,
    annotationColor,
    annotationOpacity,
    strokeWidth,
    setSelectedTool,
    setAnnotationColor,
    setAnnotationOpacity,
    setStrokeWidth,
    undo,
    redo,
    saveDocument
  } = usePDFStore();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showMoreTools, setShowMoreTools] = useState(false);

  const primaryTools = ANNOTATION_TOOLS.filter(tool => tool.primary);
  const secondaryTools = ANNOTATION_TOOLS.filter(tool => !tool.primary);

  const handleToolSelect = (toolId) => {
    setSelectedTool(toolId);
  };

  const handleColorSelect = (color) => {
    setAnnotationColor(color);
    setShowColorPicker(false);
  };

  const handleSave = async () => {
    try {
      await saveDocument();
    } catch (error) {
      console.error('Failed to save document:', error);
    }
  };

  return (
    <TooltipProvider>
      <div className={cn(
        'flex items-center justify-between p-3 bg-white border-b border-gray-200 shadow-sm',
        className
      )}>
        <div className="flex items-center space-x-2">
          {/* Primary Annotation Tools */}
          <div className="flex items-center space-x-1">
            {primaryTools.map((tool) => {
              const Icon = tool.icon;
              const isActive = selectedTool === tool.id;
              
              return (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleToolSelect(tool.id)}
                      className={cn(
                        'h-9 w-9 p-0',
                        isActive && 'bg-primary-100 text-primary-700 border-primary-300'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tool.label} ({tool.shortcut})</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          <div className="h-6 border-l border-gray-300" />

          {/* More Tools Dropdown */}
          <DropdownMenu open={showMoreTools} onOpenChange={setShowMoreTools}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {secondaryTools.map((tool) => {
                const Icon = tool.icon;
                const isActive = selectedTool === tool.id;
                
                return (
                  <DropdownMenuItem
                    key={tool.id}
                    onClick={() => handleToolSelect(tool.id)}
                    className={cn(isActive && 'bg-primary-50 text-primary-700')}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    <span>{tool.label}</span>
                    <span className="ml-auto text-xs text-gray-500">{tool.shortcut}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-6 border-l border-gray-300" />

          {/* Color and Style Controls */}
          <DropdownMenu open={showColorPicker} onOpenChange={setShowColorPicker}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 px-3">
                <Palette className="h-4 w-4 mr-1" />
                <div 
                  className="h-3 w-3 rounded-sm border border-gray-300"
                  style={{ backgroundColor: annotationColor || '#3b82f6' }}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-3">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Color</label>
                  <div className="grid grid-cols-5 gap-2">
                    {COLOR_PALETTE.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => handleColorSelect(color.value)}
                        className={cn(
                          'h-8 w-8 rounded-md border border-gray-300 hover:scale-110 transition-transform',
                          annotationColor === color.value && 'ring-2 ring-primary-500 ring-offset-1'
                        )}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {annotationOpacity !== undefined && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Opacity</label>
                      <span className="text-xs text-gray-500">{Math.round((annotationOpacity || 1) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={annotationOpacity || 1}
                      onChange={(e) => setAnnotationOpacity(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}

                {(selectedTool === 'pen' || selectedTool === 'rectangle' || selectedTool === 'circle' || selectedTool === 'arrow') && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Stroke Width</label>
                      <span className="text-xs text-gray-500">{strokeWidth || 2}px</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={strokeWidth || 2}
                      onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          {/* History Actions */}
          <div className="flex items-center space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={undo}
                  className="h-9 w-9 p-0"
                >
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Undo (Ctrl+Z)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={redo}
                  className="h-9 w-9 p-0"
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Redo (Ctrl+Y)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="h-6 border-l border-gray-300" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Annotation Settings</p>
            </TooltipContent>
          </Tooltip>

          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            className="h-9"
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
