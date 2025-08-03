import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui';
import { usePDFStore } from '../../stores';
import { cn } from '../../utils';
import toast from 'react-hot-toast';

export function FileUpload({ className }) {
  const { setCurrentPDF, setCurrentPage, setTotalPages } = usePDFStore();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const processFile = useCallback(async (file) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Create file URL for PDF.js
      const fileUrl = URL.createObjectURL(file);
      
      // Set the PDF in store
      setCurrentPDF(fileUrl);
      setCurrentPage(1);
      
      // Complete progress
      setUploadProgress(100);
      
      // Add to uploaded files list
      setUploadedFiles(prev => [...prev, {
        id: Date.now(),
        name: file.name,
        size: file.size,
        url: fileUrl,
        type: file.type
      }]);

      toast.success(`Successfully loaded ${file.name}`);
      
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error(`Failed to load ${file.name}: ${error.message}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [setCurrentPDF, setCurrentPage]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    rejectedFiles.forEach((rejection) => {
      const { file, errors } = rejection;
      errors.forEach((error) => {
        if (error.code === 'file-too-large') {
          toast.error(`${file.name} is too large. Maximum size is 100MB.`);
        } else if (error.code === 'file-invalid-type') {
          toast.error(`${file.name} is not a supported file type.`);
        } else {
          toast.error(`Error with ${file.name}: ${error.message}`);
        }
      });
    });

    // Process accepted files
    acceptedFiles.forEach(processFile);
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 5,
    multiple: true
  });

  const removeFile = useCallback((fileId) => {
    setUploadedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      // If removing the current file, clear the PDF viewer
      const removedFile = prev.find(f => f.id === fileId);
      if (removedFile && removedFile.url) {
        URL.revokeObjectURL(removedFile.url);
        // If this was the current PDF, clear it
        setCurrentPDF(null);
      }
      return updated;
    });
  }, [setCurrentPDF]);

  const selectFile = useCallback((file) => {
    setCurrentPDF(file.url);
    setCurrentPage(1);
    toast.success(`Switched to ${file.name}`);
  }, [setCurrentPDF, setCurrentPage]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('p-6', className)}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive && !isDragReject && 'border-primary-500 bg-primary-50',
          isDragReject && 'border-red-500 bg-red-50',
          !isDragActive && 'border-gray-300 hover:border-gray-400',
          isUploading && 'pointer-events-none opacity-50'
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center">
          <Upload className={cn(
            'h-12 w-12 mb-4',
            isDragActive && !isDragReject && 'text-primary-500',
            isDragReject && 'text-red-500',
            !isDragActive && 'text-gray-400'
          )} />
          
          {isDragActive ? (
            isDragReject ? (
              <p className="text-red-600">Some files are not supported</p>
            ) : (
              <p className="text-primary-600">Drop files here to upload</p>
            )
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supports PDF, images, Word, PowerPoint, and Excel files up to 100MB
              </p>
              <Button variant="outline" size="sm">
                Choose Files
              </Button>
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {isUploading && uploadProgress > 0 && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-white rounded-lg p-3 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Uploading...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Files</h3>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center flex-1 min-w-0">
                  <FileText className="h-8 w-8 text-red-500 flex-shrink-0" />
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectFile(file)}
                  >
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">Supported Features</h4>
            <div className="mt-1 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>PDF viewing and annotation</li>
                <li>Document conversion (Office files to PDF)</li>
                <li>Image to PDF conversion</li>
                <li>Multiple file upload</li>
                <li>Drag and drop support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FileInfo({ file, onRemove, className }) {
  if (!file) return null

  return (
    <div className={cn(
      'flex items-center justify-between p-4 bg-secondary-50 rounded-lg border border-secondary-200',
      className
    )}>
      <div className="flex items-center space-x-3">
        <FileText className="h-8 w-8 text-primary-500" />
        <div>
          <p className="font-medium text-secondary-900">{file.name}</p>
          <p className="text-sm text-secondary-500">
            {formatFileSize(file.size)} • PDF Document
          </p>
        </div>
      </div>
      
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-secondary-400 hover:text-red-500"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

export function UploadProgress({ progress, fileName }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-secondary-700">
          Uploading {fileName}
        </span>
        <span className="text-sm text-secondary-500">
          {Math.round(progress)}%
        </span>
      </div>
      
      <div className="w-full bg-secondary-200 rounded-full h-2">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export function RecentFiles({ files = [], onFileSelect, className }) {
  if (files.length === 0) return null

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-sm font-medium text-secondary-700">Recent Files</h3>
      
      <div className="space-y-2">
        {files.map((file, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 hover:bg-secondary-50 rounded-lg cursor-pointer transition-colors"
            onClick={() => onFileSelect(file)}
          >
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-primary-500" />
              <div>
                <p className="text-sm font-medium text-secondary-900">
                  {file.name}
                </p>
                <p className="text-xs text-secondary-500">
                  {formatFileSize(file.size)} • {file.lastModified ? new Date(file.lastModified).toLocaleDateString() : 'Unknown date'}
                </p>
              </div>
            </div>
            
            <Button variant="ghost" size="sm">
              Open
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
