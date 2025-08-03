import React, { useState, useEffect } from 'react';
import { usePDFStore } from '../../stores';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { 
  Search, 
  Clock, 
  Star, 
  Folder, 
  File, 
  Download,
  Trash2,
  Share2,
  Copy,
  Eye,
  MoreHorizontal 
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/DropdownMenu';
import { cn } from '../../utils';

export function DocumentManager({ isOpen, onClose }) {
  const { 
    recentDocuments = [], 
    favoriteDocuments = [], 
    addToRecent,
    addToFavorites,
    removeFromFavorites,
    loadDocument 
  } = usePDFStore();

  const [activeTab, setActiveTab] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDocuments, setFilteredDocuments] = useState([]);

  // Filter documents based on search query
  useEffect(() => {
    const documents = activeTab === 'recent' ? recentDocuments : favoriteDocuments;
    const filtered = documents.filter(doc => 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.path?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDocuments(filtered);
  }, [searchQuery, activeTab, recentDocuments, favoriteDocuments]);

  const handleDocumentOpen = async (document) => {
    try {
      await loadDocument(document);
      onClose();
    } catch (error) {
      console.error('Failed to open document:', error);
    }
  };

  const handleAddToFavorites = (document) => {
    addToFavorites(document);
  };

  const handleRemoveFromFavorites = (documentId) => {
    removeFromFavorites(documentId);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Folder className="h-5 w-5" />
            <span>Document Manager</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('recent')}
              className={cn(
                'flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                activeTab === 'recent'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Clock className="h-4 w-4" />
              <span>Recent ({recentDocuments.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={cn(
                'flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                activeTab === 'favorites'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Star className="h-4 w-4" />
              <span>Favorites ({favoriteDocuments.length})</span>
            </button>
          </div>

          {/* Document List */}
          <div className="flex-1 overflow-y-auto">
            {filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <File className="h-12 w-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">
                  {searchQuery ? 'No documents found' : `No ${activeTab} documents`}
                </p>
                <p className="text-sm">
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : `${activeTab === 'recent' ? 'Open some documents to see them here' : 'Star documents to add them to favorites'}`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDocuments.map((document, index) => (
                  <div
                    key={document.id || index}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {/* Document Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <File className="h-5 w-5 text-red-600" />
                      </div>
                    </div>

                    {/* Document Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {document.name}
                        </h3>
                        {activeTab === 'favorites' && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>{formatFileSize(document.size || 0)}</span>
                        <span>•</span>
                        <span>{document.pages || 0} pages</span>
                        <span>•</span>
                        <span>{formatDate(document.lastAccessed || document.created)}</span>
                      </div>
                      {document.path && (
                        <p className="text-xs text-gray-400 truncate mt-1">
                          {document.path}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDocumentOpen(document)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Open
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {activeTab === 'recent' ? (
                            <DropdownMenuItem onClick={() => handleAddToFavorites(document)}>
                              <Star className="h-4 w-4 mr-2" />
                              Add to Favorites
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleRemoveFromFavorites(document.id)}>
                              <Star className="h-4 w-4 mr-2 fill-current" />
                              Remove from Favorites
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Path
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove from {activeTab}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {filteredDocuments.length} of {activeTab === 'recent' ? recentDocuments.length : favoriteDocuments.length} documents
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                variant="outline"
                onClick={() => document.querySelector('input[type="file"]')?.click()}
              >
                <File className="h-4 w-4 mr-2" />
                Open New
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
