import React, { useState, useRef, DragEvent } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  BookMarked,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (uploadedDoc: any) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [subject, setSubject] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [processedDoc, setProcessedDoc] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const allowedExtensions = ['.pdf', '.docx', '.pptx', '.txt'];

  const validateFile = (file: File): boolean => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setErrorMessage(`Unsupported file format "${ext}". Please upload .pdf, .docx, .pptx, or .txt only.`);
      return false;
    }
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 25MB limit. Please upload a smaller file.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
    // Reset value so selecting the same file again triggers onChange
    if (e.target) {
      e.target.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      openFilePicker();
      return;
    }

    setIsUploading(true);
    setErrorMessage('');
    setUploadProgress(10);
    setStatusMessage('Uploading study document...');

    try {
      const progressTimer = setInterval(() => {
        setUploadProgress(prev => {
          if (prev < 40) return prev + 15;
          if (prev < 70) {
            setStatusMessage('Extracting text & chunking sections...');
            return prev + 10;
          }
          if (prev < 90) {
            setStatusMessage('AI generating summary, exam questions & MCQs...');
            return prev + 5;
          }
          return prev;
        });
      }, 400);

      const res = await api.uploadDocument(selectedFile, subject, (pct) => {
        // Real upload progress from XHR
        if (pct < 50) setUploadProgress(pct);
      });

      clearInterval(progressTimer);
      setUploadProgress(100);
      setStatusMessage('✓ Processing completed');
      setIsDone(true);
      setProcessedDoc(res.document);

    } catch (err: any) {
      setIsUploading(false);
      setUploadProgress(0);
      setStatusMessage('');
      let msg = err.message || 'Sorry, we couldn\'t process this document. Please try uploading another file.';
      if (msg.includes('Network error') || msg.includes('Failed to fetch')) {
        msg = 'Cannot connect to backend server. Please make sure the backend is running on http://localhost:5000.';
      }
      setErrorMessage(msg);
    }
  };

  const handleClose = () => {
    if (isUploading && !isDone) {
      if (!confirm('Document is currently being processed. Are you sure you want to cancel?')) {
        return;
      }
    }
    setSelectedFile(null);
    setIsUploading(false);
    setIsDone(false);
    setErrorMessage('');
    setStatusMessage('');
    setUploadProgress(0);
    onClose();
  };

  const handleGoToDocument = () => {
    if (processedDoc) {
      onSuccess(processedDoc);
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Upload Study Material
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                PDF, DOCX, PPTX, or TXT for AI exam analysis
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Success State */}
          {isDone ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  Document Ready for Study!
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedFile?.name}</span>
                </p>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
                  ✓ Processing completed & AI summary generated
                </p>
              </div>

              <div className="pt-4 flex justify-center">
                <button
                  onClick={handleGoToDocument}
                  className="flex items-center space-x-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Open Study Material Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Drag & Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={openFilePicker}
                className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[1.01]'
                    : selectedFile
                    ? 'border-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  id="study-material-file-input"
                  type="file"
                  accept=".pdf,.docx,.pptx,.txt"
                  onChange={handleFileChange}
                  onClick={(e) => e.stopPropagation()}
                  className="hidden"
                />

                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                    <FileText className="w-7 h-7" />
                  </div>

                  <div>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                      Drag & Drop your study material here
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      or click anywhere in this box to select a document
                    </p>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openFilePicker();
                      }}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/80 transition-colors cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Browse Files from Computer</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400 font-medium">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">.PDF</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">.DOCX</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">.PPTX</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">.TXT</span>
                    <span>(Max 25MB)</span>
                  </div>
                </div>
              </div>

              {/* Selected File Details */}
              {selectedFile && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 truncate">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {selectedFile.name.split('.').pop()}
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatFileSize(selectedFile.size)} • Type: {selectedFile.name.split('.').pop()?.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {!isUploading && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        title="Remove selected file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Upload Progress & Status */}
                  {isUploading && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-600 dark:text-slate-300 flex items-center space-x-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                          <span>{statusMessage}</span>
                        </span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Subject Tag Input (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Subject / Course Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Operating Systems, DBMS, Computer Networks..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={isUploading}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Error Message Display */}
              {errorMessage && (
                <div className="flex items-start space-x-2.5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isUploading}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={selectedFile ? handleUpload : openFilePicker}
                  disabled={isUploading}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading & Processing...</span>
                    </>
                  ) : selectedFile ? (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload & Process Material</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Choose File to Upload</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
