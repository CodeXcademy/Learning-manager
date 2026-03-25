import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Tag, File, FileText, Book, Clock, HardDrive } from 'lucide-react';
import { StoredDocument } from '../hooks/useDocumentLibrary';

interface DocumentListProps {
  documents: StoredDocument[];
  onSelect: (document: StoredDocument) => void;
  onDelete: (id: string) => void;
  selectedId?: string;
  onAddTag?: (docId: string, tag: string) => void;
}

/**
 * DocumentList - List view component for displaying documents
 * Shows document metadata in a compact table-like format
 */
export function DocumentList({
  documents,
  onSelect,
  onDelete,
  selectedId,
  onAddTag,
}: DocumentListProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'epub':
        return <Book className="w-4 h-4 text-purple-500" />;
      case 'markdown':
        return <File className="w-4 h-4 text-blue-500" />;
      default:
        return <File className="w-4 h-4 text-on-surface-variant" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="border border-outline-variant/20 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-surface-container sticky top-0 z-10 grid grid-cols-12 gap-4 px-4 py-3 border-b border-outline-variant/10 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
        <div className="col-span-6 flex items-center gap-2">
          <span>Name</span>
        </div>
        <div className="col-span-2 text-right">Size</div>
        <div className="col-span-2 text-right">Date Added</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {/* Documents */}
      <AnimatePresence mode="popLayout">
        <div className="divide-y divide-outline-variant/10">
          {documents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-8 text-center text-on-surface-variant"
            >
              <File className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm">No documents found</p>
            </motion.div>
          ) : (
            documents.map(doc => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                onClick={() => onSelect(doc)}
                className={`grid grid-cols-12 gap-4 px-4 py-3 cursor-pointer transition-colors ${
                  selectedId === doc.id
                    ? 'bg-primary/10 border-l-2 border-primary'
                    : 'hover:bg-surface-container/50'
                }`}
              >
                {/* Name */}
                <div className="col-span-6 flex items-center gap-3 min-w-0">
                  {getIcon(doc.type)}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-on-surface truncate hover:text-primary transition-colors">
                      {doc.name}
                    </p>
                    {doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {doc.tags.slice(0, 2).map(tag => (
                          <span
                            key={tag}
                            className="inline-block px-1.5 py-0.5 bg-tertiary-container/20 text-tertiary text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {doc.tags.length > 2 && (
                          <span className="text-xs text-on-surface-variant">
                            +{doc.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Size */}
                <div className="col-span-2 flex items-center justify-end gap-1 text-on-surface-variant text-sm">
                  <HardDrive className="w-3.5 h-3.5 opacity-50" />
                  <span className="text-right">{formatSize(doc.size)}</span>
                </div>

                {/* Date Added */}
                <div className="col-span-2 flex items-center justify-end gap-1 text-on-surface-variant text-sm">
                  <Clock className="w-3.5 h-3.5 opacity-50" />
                  <span className="text-right">{formatDate(doc.dateAdded)}</span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end gap-1 opacity-0 hover:opacity-100 transition-opacity">
                  {onAddTag && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        // Open tag selector
                      }}
                      className="p-1.5 hover:bg-secondary-container/20 text-secondary rounded transition-colors"
                      title="Add tags"
                    >
                      <Tag className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onDelete(doc.id);
                    }}
                    className="p-1.5 hover:bg-error/20 text-error rounded transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </AnimatePresence>
    </div>
  );
}
