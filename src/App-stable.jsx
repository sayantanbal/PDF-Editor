import React, { useEffect, useState, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { TooltipProvider } from './components/ui/Tooltip';
import { Button } from './components/ui/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './components/ui/DropdownMenu';
import { FileUpload } from './components/pdf/FileUpload';
import { usePDFStore } from './stores';
import { Menu, FileText, Settings, User, LogOut } from 'lucide-react';

// Lazy load heavy components
const PDFViewer = React.lazy(() => import('./components/pdf/PDFViewer').then(module => ({ default: module.PDFViewer })));
const Toolbar = React.lazy(() => import('./components/pdf/Toolbar').then(module => ({ default: module.Toolbar })));
const AnnotationToolbar = React.lazy(() => import('./components/pdf/AnnotationToolbar').then(module => ({ default: module.AnnotationToolbar })));
const EnhancedSidebar = React.lazy(() => import('./components/pdf/EnhancedSidebar').then(module => ({ default: module.EnhancedSidebar })));

// Loading fallback component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  const [isReady, setIsReady] = useState(true);
  
  try {
    const { 
      currentPDF, 
      sidebarOpen = true, 
      setSidebarOpen,
      currentDocument
    } = usePDFStore();

    // Initialize keyboard shortcuts
    useEffect(() => {
      const handleKeydown = (e) => {
        try {
          if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
              case 'o':
                e.preventDefault();
                document.querySelector('input[type="file"]')?.click();
                break;
              case 's':
                e.preventDefault();
                break;
              case 'b':
                e.preventDefault();
                if (setSidebarOpen) setSidebarOpen(!sidebarOpen);
                break;
            }
          }
          if (e.key === 'F9') {
            e.preventDefault();
            if (setSidebarOpen) setSidebarOpen(!sidebarOpen);
          }
        } catch (error) {
          console.error('Keyboard shortcut error:', error);
        }
      };

      window.addEventListener('keydown', handleKeydown);
      return () => window.removeEventListener('keydown', handleKeydown);
    }, [sidebarOpen, setSidebarOpen]);

    if (!isReady) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      );
    }

    return (
      <TooltipProvider>
        <div className="flex flex-col h-screen bg-gray-100">
          {/* Top Header */}
          <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen && setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">PDF Editor Pro</h1>
                  <p className="text-xs text-gray-500">Professional PDF Editing Suite</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {currentDocument && (
                <div className="hidden sm:block text-sm text-gray-600">
                  {currentDocument.name || 'Untitled Document'}
                </div>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-xs text-gray-500">john@example.com</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            {sidebarOpen && (
              <div className="block lg:block transition-all duration-300">
                <Suspense fallback={<div className="w-80 bg-white border-r border-gray-200 h-full"><LoadingSpinner /></div>}>
                  <EnhancedSidebar
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen && setSidebarOpen(!sidebarOpen)}
                  />
                </Suspense>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* PDF Toolbar */}
              {currentPDF && (
                <Suspense fallback={<LoadingSpinner />}>
                  <Toolbar />
                </Suspense>
              )}
              
              {/* Annotation Toolbar */}
              {currentPDF && (
                <Suspense fallback={<LoadingSpinner />}>
                  <AnnotationToolbar />
                </Suspense>
              )}
              
              {/* PDF Viewer or Upload Area */}
              <div className="flex-1 overflow-hidden">
                {currentPDF ? (
                  <Suspense fallback={<div className="h-full bg-gray-50 flex items-center justify-center"><LoadingSpinner /></div>}>
                    <PDFViewer />
                  </Suspense>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-8">
                    <div className="max-w-2xl w-full mx-auto">
                      <div className="text-center mb-8">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          Welcome to PDF Editor Pro
                        </h2>
                        <p className="text-gray-600">
                          Upload a PDF file to start editing with professional-grade tools
                        </p>
                      </div>
                      
                      <FileUpload />

                      {/* Features Overview */}
                      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-white p-4 rounded-lg border">
                          <h3 className="font-semibold text-gray-900 mb-2">Annotation Tools</h3>
                          <ul className="text-gray-600 space-y-1">
                            <li>• Highlighting and text markup</li>
                            <li>• Sticky notes and comments</li>
                            <li>• Drawing and shapes</li>
                          </ul>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border">
                          <h3 className="font-semibold text-gray-900 mb-2">Document Management</h3>
                          <ul className="text-gray-600 space-y-1">
                            <li>• Page thumbnails and navigation</li>
                            <li>• Bookmarks and search</li>
                            <li>• Multiple file support</li>
                          </ul>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border">
                          <h3 className="font-semibold text-gray-900 mb-2">Professional Features</h3>
                          <ul className="text-gray-600 space-y-1">
                            <li>• Real-time collaboration</li>
                            <li>• Version history</li>
                            <li>• Export and sharing</li>
                          </ul>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border">
                          <h3 className="font-semibold text-gray-900 mb-2">File Formats</h3>
                          <ul className="text-gray-600 space-y-1">
                            <li>• PDF files</li>
                            <li>• Office documents</li>
                            <li>• Images and scans</li>
                          </ul>
                        </div>
                      </div>

                      {/* Keyboard Shortcuts Info */}
                      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">Keyboard Shortcuts</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                          <div>Ctrl+O - Open file</div>
                          <div>Ctrl+S - Save</div>
                          <div>Ctrl+B - Toggle sidebar</div>
                          <div>F9 - Toggle sidebar</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setSidebarOpen && setSidebarOpen(false)}
            />
          )}

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </div>
      </TooltipProvider>
    );
  } catch (error) {
    console.error('App component error:', error);
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 mb-4">
            <FileText className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">PDF Editor Pro</h2>
          <p className="text-gray-600 mb-4">Application error. Please refresh the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }
}

export default App;
