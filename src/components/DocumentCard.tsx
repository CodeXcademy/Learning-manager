import React from 'react';
import { motion } from 'motion/react';
import { Trash2, Tag, MoreVertical, FileText, File } from 'lucide-react';
import { StoredDocument } from '../hooks/useDocumentLibrary';

interface DocumentCardProps {
  document: StoredDocument;
  onSelect: (document: StoredDocument) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onAddTag?: (docId: string, tag: string) => void;
}

/**
 * DocumentCard - Grid view component for displaying documents
 * Shows document preview, metadata, and quick actions
 */
export function DocumentCard({
  document,
  onSelect,
  onDelete,
  isSelected = false,
  onAddTag,
}: DocumentCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const formattedDate = new Date(document.dateAdded).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedSize = (document.size / 1024 / 1024).toFixed(2);

  const typeConfig = {
    pdf: { icon: '📄', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    epub: { icon: '📕', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    markdown: { icon: '📝', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  };

  const config = typeConfig[document.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className={`bg-surface-container rounded-lg border transition-all duration-200 overflow-hidden group cursor-pointer ${
        isSelected
          ? 'border-primary ring-2 ring-primary/30'
          : 'border-outline-variant/20 hover:border-outline-variant/40'
      }`}
      onClick={() => onSelect(document)}
    >
      {/* Document Preview / Thumbnail */}
      <div
        className={`h-40 ${config.bg} border-b ${config.border} flex items-center justify-center text-4xl relative overflow-hidden`}
      >
        {document.thumbnail ? (
          <span className="text-3xl">{document.thumbnail}</span>
        ) : (
          <FileText className="w-16 h-16 text-on-surface-variant/50" />
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={e => {
              e.stopPropagation();
              onSelect(document);
            }}
            className="px-3 py-1 bg-primary text-on-primary text-xs font-medium rounded-full"
          >
            Open
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Document Title */}
        <h3 className="font-headline text-sm font-bold text-on-surface truncate mb-1 group-hover:text-primary transition-colors">
          {document.name}
        </h3>

        {/* Metadata */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-on-surface-variant">
            {document.type.toUpperCase()} • {formattedSize} MB
          </span>
          <button
            onClick={e => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Date Added */}
        <p className="text-xs text-on-surface-variant mb-3">{formattedDate}</p>

        {/* Tags */}
        {document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {document.tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="inline-block px-2 py-1 bg-tertiary-container/30 text-tertiary text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {document.tags.length > 2 && (
              <span className="inline-block px-2 py-1 text-xs text-on-surface-variant">
                +{document.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={e => {
              e.stopPropagation();
              onDelete(document.id);
            }}
            className="flex-1 px-3 py-2 bg-error/10 text-error text-xs font-medium rounded-lg hover:bg-error/20 transition-colors flex items-center justify-center gap-1"
            title="Delete document"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
          {onAddTag && (
            <button
              onClick={e => {
                e.stopPropagation();
                // In a real implementation, this would open a tag selector
              }}
              className="flex-1 px-3 py-2 bg-secondary-container/10 text-secondary text-xs font-medium rounded-lg hover:bg-secondary-container/20 transition-colors flex items-center justify-center gap-1"
              title="Add tags"
            >
              <Tag className="w-3.5 h-3.5" />
              Tag
            </button>
          )}
        </div>
      </div>

      {/* Pages Badge for PDFs */}
      {document.type === 'pdf' && document.metadata?.pages && (
        <div className="px-4 py-2 bg-surface text-xs text-on-surface-variant border-t border-outline-variant/10">
          {document.metadata.pages} pages
        </div>
      )}
    </motion.div>
  );
}
