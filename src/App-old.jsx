import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { TooltipProvider } from './components/ui/Tooltip';
import { FileUpload } from './components/pdf/FileUpload';
import { PDFViewer } from './components/pdf/PDFViewer';
import { Toolbar } from './components/pdf/Toolbar';
import { AnnotationToolbar } from './components/pdf/AnnotationToolbar';
import { EnhancedSidebar } from './components/pdf/EnhancedSidebar';
import { usePDFStore } from './stores';
import { Menu, FileText, Settings, User, LogOut } from 'lucide-react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './components/ui';

function App() {
  const { currentDocument } = usePDFStore()
  const { unloadPDF } = usePDFManager()
  const { handleKeyDown } = useKeyboardShortcuts()
  const [isMobileView, setIsMobileView] = useState(false)

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(isMobile())
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Add keyboard shortcuts
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleRemoveFile = () => {
    unloadPDF()
  }

  if (!currentDocument) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <Toaster position="top-right" />
        
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-secondary-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-secondary-900">
                    Professional PDF Editor
                  </h1>
                  <p className="text-sm text-secondary-500 hidden sm:block">
                    Edit, annotate, and collaborate on PDF documents
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="text-secondary-500 hover:text-secondary-700">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </button>
                
                <button className="text-secondary-500 hover:text-secondary-700">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Welcome to PDF Editor
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Upload your PDF document to start editing, annotating, and collaborating. 
              Our professional-grade editor supports all major PDF features.
            </p>
          </div>

          {/* Upload Section */}
          <div className="max-w-2xl mx-auto">
            <FileUpload className="mb-8" />
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              <FeatureCard
                icon={
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                }
                title="Smart Editing"
                description="Edit text directly in PDF documents with OCR support and font matching"
              />
              
              <FeatureCard
                icon={
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2C7 1.44772 7.44772 1 8 1H16C16.5523 1 17 1.44772 17 2V4M7 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4H17M7 4H17" />
                  </svg>
                }
                title="Rich Annotations"
                description="Add highlights, comments, drawings, stamps, and sticky notes"
              />
              
              <FeatureCard
                icon={
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
                title="Real-time Collaboration"
                description="Work together with team members in real-time with live cursors and comments"
              />
              
              <FeatureCard
                icon={
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
                title="Enterprise Security"
                description="Password protection, digital signatures, and permission controls"
              />
              
              <FeatureCard
                icon={
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                }
                title="Multiple Formats"
                description="Export to Word, Excel, PowerPoint, images, and other formats"
              />
              
              <FeatureCard
                icon={
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                }
                title="Mobile Ready"
                description="Full-featured editing experience on tablets and mobile devices"
              />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-secondary-50">
      <Toaster position="top-right" />
      
      {/* Desktop Layout */}
      {!isMobileView ? (
        <>
          {/* Toolbar */}
          <Toolbar />
          
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <Sidebar />
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* File Info */}
              <div className="p-4 bg-white border-b border-secondary-200">
                <FileInfo 
                  file={currentDocument} 
                  onRemove={handleRemoveFile}
                />
              </div>
              
              {/* PDF Viewer */}
              <PDFViewer className="flex-1" />
            </div>
          </div>
        </>
      ) : (
        /* Mobile Layout */
        <>
          {/* Mobile Header */}
          <div className="bg-white border-b border-secondary-200 p-4">
            <FileInfo 
              file={currentDocument} 
              onRemove={handleRemoveFile}
              className="mb-4"
            />
          </div>
          
          {/* PDF Viewer */}
          <PDFViewer className="flex-1" />
          
          {/* Mobile Toolbar */}
          <MobileToolbar />
        </>
      )}
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-secondary-200 hover:shadow-md transition-shadow">
      <div className="text-primary-600 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-secondary-900 mb-2">
        {title}
      </h3>
      <p className="text-secondary-600 text-sm">
        {description}
      </p>
    </div>
  )
}

export default App
