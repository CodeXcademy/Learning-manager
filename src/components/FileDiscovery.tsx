import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Upload, FileText, Folder, AlertCircle, CheckCircle2 } from 'lucide-react';

interface FileDiscoveryProps {
  onFilesSelected: (files: File[]) => Promise<void>;
  isLoading?: boolean;
  allowMultiple?: boolean;
}

/**
 * FileDiscovery - Component for file upload and selection
 * Supports drag-and-drop and file input for PDF, EPUB, and Markdown files
 */
export function FileDiscovery({ onFilesSelected, isLoading = false, allowMultiple = true }: FileDiscoveryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  const ACCEPTED_TYPES = ['.pdf', '.epub', '.md', '.markdown'];
  const ACCEPTED_MIME = ['application/pdf', 'application/epub+zip', 'text/markdown', 'text/plain'];

  const validateFiles = (files: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        errors.push(`${file.name} is too large (max 50MB)`);
        return;
      }

      // Check file type
      const isValidType =
        ACCEPTED_MIME.includes(file.type) ||
        ACCEPTED_TYPES.some(ext => file.name.toLowerCase().endsWith(ext));

      if (!isValidType) {
        errors.push(`${file.name} is not a supported file type (PDF, EPUB, or Markdown)`);
        return;
      }

      valid.push(file);
    });

    return { valid, errors };
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const { valid, errors } = validateFiles(fileArray);

    if (errors.length > 0) {
      setUploadStatus('error');
      setUploadMessage(errors.join('\n'));
      setTimeout(() => setUploadStatus('idle'), 4000);
      return;
    }

    try {
      setUploadStatus('loading');
      setUploadMessage(`Uploading ${valid.length} file(s)...`);
      
      await onFilesSelected(valid);

      setUploadStatus('success');
      setUploadMessage(`Successfully added ${valid.length} file(s)`);
      setTimeout(() => setUploadStatus('idle'), 3000);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage('Failed to upload files. Please try again.');
      console.error('File upload error:', error);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <div className="w-full">
      {/* Main Upload Area */}
      <motion.div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        animate={{
          backgroundColor: dragActive ? 'rgba(var(--primary), 0.05)' : 'transparent',
          borderColor: dragActive ? 'rgb(var(--primary))' : 'rgb(var(--outline-variant))',
        }}
        className={`relative rounded-xl border-2 border-dashed p-8 transition-colors ${
          dragActive ? 'bg-primary/5' : 'bg-surface-container/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={allowMultiple}
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleInputChange}
          disabled={isLoading || uploadStatus === 'loading'}
          className="hidden"
          aria-label="Upload documents"
        />

        {/* Content */}
        <div className="flex flex-col items-center justify-center text-center">
          <motion.div
            animate={{ scale: dragActive ? 1.1 : 1 }}
            className="mb-4"
          >
            <Upload
              className={`w-12 h-12 mx-auto transition-colors ${
                dragActive ? 'text-primary' : 'text-on-surface-variant/50'
              }`}
            />
          </motion.div>

          <h3 className="text-lg font-headline font-semibold text-on-surface mb-2">
            {dragActive ? 'Drop files here' : 'Upload Documents'}
          </h3>

          <p className="text-sm text-on-surface-variant mb-4">
            Drag and drop your files here, or click to browse
          </p>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || uploadStatus === 'loading'}
              className="px-6 py-2 bg-primary text-on-primary font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadStatus === 'loading' ? 'Uploading...' : 'Select Files'}
            </button>

            <p className="text-xs text-on-surface-variant">
              Supported: PDF, EPUB, Markdown • Max 50MB per file
            </p>
          </div>
        </div>
      </motion.div>

      {/* Status Message */}
      {uploadStatus !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
            uploadStatus === 'error'
              ? 'bg-error/10 border border-error/30'
              : uploadStatus === 'success'
                ? 'bg-tertiary/10 border border-tertiary/30'
                : 'bg-primary/10 border border-primary/30'
          }`}
        >
          {uploadStatus === 'error' ? (
            <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
          ) : uploadStatus === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-tertiary shrink-0 mt-0.5" />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          )}
          <div>
            <p
              className={`text-sm font-medium ${
                uploadStatus === 'error'
                  ? 'text-error'
                  : uploadStatus === 'success'
                    ? 'text-tertiary'
                    : 'text-primary'
              }`}
            >
              {uploadMessage}
            </p>
          </div>
        </motion.div>
      )}

      {/* File Formats Info */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { icon: '📄', label: 'PDF', desc: 'Portable Document Format' },
          { icon: '📕', label: 'EPUB', desc: 'Electronic Publication' },
          { icon: '📝', label: 'Markdown', desc: 'Text Documents' },
        ].map(format => (
          <motion.div
            key={format.label}
            whileHover={{ y: -2 }}
            className="p-4 bg-surface-container rounded-lg border border-outline-variant/10 text-center"
          >
            <div className="text-2xl mb-2">{format.icon}</div>
            <p className="font-medium text-sm text-on-surface">{format.label}</p>
            <p className="text-xs text-on-surface-variant mt-1">{format.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
