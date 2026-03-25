import { useCallback, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface StoredDocument {
  id: string;
  name: string;
  type: 'pdf' | 'epub' | 'markdown';
  size: number;
  dateAdded: string;
  lastOpened?: string;
  dataUrl: string; // Base64 encoded file data
  collectionId?: string;
  tags: string[];
  thumbnail?: string;
  metadata?: {
    pages?: number;
    title?: string;
    author?: string;
  };
}

interface DocumentLibraryState {
  documents: StoredDocument[];
  collections: { id: string; name: string; count: number }[];
}

const DOCUMENT_STORAGE_KEY = 'app-documents-library';
const INITIAL_STATE: DocumentLibraryState = {
  documents: [],
  collections: [],
};

/**
 * Hook for managing local document storage and retrieval
 * Handles PDF, EPUB, and Markdown files with local-first approach
 */
export function useDocumentLibrary() {
  const [libraryState, setLibraryState] = useLocalStorage<DocumentLibraryState>(
    DOCUMENT_STORAGE_KEY,
    INITIAL_STATE
  );
  const [processingFile, setProcessingFile] = useState(false);

  // Add a new document
  const addDocument = useCallback(
    async (file: File, collectionId?: string): Promise<StoredDocument | null> => {
      try {
        setProcessingFile(true);
        
        // Validate file type
        const validTypes = ['application/pdf', 'application/epub+zip', 'text/markdown', 'text/plain'];
        if (!validTypes.includes(file.type) && !file.name.endsWith('.epub') && !file.name.endsWith('.md')) {
          console.error('Invalid file type:', file.type);
          return null;
        }

        // Read file as base64
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Generate thumbnail (for PDFs, we'll create a basic icon)
        let thumbnail: string | undefined;
        if (file.type === 'application/pdf') {
          thumbnail = '📄'; // Placeholder - can be enhanced with actual PDF first page render
        } else if (file.name.endsWith('.epub')) {
          thumbnail = '📕';
        } else {
          thumbnail = '📝';
        }

        const newDocument: StoredDocument = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.name.endsWith('.epub') ? 'epub' : file.type === 'application/pdf' ? 'pdf' : 'markdown',
          size: file.size,
          dateAdded: new Date().toISOString(),
          dataUrl,
          collectionId,
          tags: [],
          thumbnail,
        };

        setLibraryState(prev => ({
          ...prev,
          documents: [newDocument, ...prev.documents],
        }));

        setProcessingFile(false);
        return newDocument;
      } catch (error) {
        console.error('Error adding document:', error);
        setProcessingFile(false);
        return null;
      }
    },
    [setLibraryState]
  );

  // Update document metadata
  const updateDocument = useCallback(
    (id: string, updates: Partial<StoredDocument>) => {
      setLibraryState(prev => ({
        ...prev,
        documents: prev.documents.map(doc =>
          doc.id === id ? { ...doc, ...updates } : doc
        ),
      }));
    },
    [setLibraryState]
  );

  // Delete a document
  const deleteDocument = useCallback(
    (id: string) => {
      setLibraryState(prev => ({
        ...prev,
        documents: prev.documents.filter(doc => doc.id !== id),
      }));
    },
    [setLibraryState]
  );

  // Get documents by collection
  const getDocumentsByCollection = useCallback(
    (collectionId: string) => {
      return libraryState.documents.filter(doc => doc.collectionId === collectionId);
    },
    [libraryState.documents]
  );

  // Get all uncategorized documents
  const getUncategorizedDocuments = useCallback(
    () => {
      return libraryState.documents.filter(doc => !doc.collectionId);
    },
    [libraryState.documents]
  );

  // Search documents
  const searchDocuments = useCallback(
    (query: string) => {
      const lowercaseQuery = query.toLowerCase();
      return libraryState.documents.filter(doc =>
        doc.name.toLowerCase().includes(lowercaseQuery) ||
        doc.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
    },
    [libraryState.documents]
  );

  // Add tag to document
  const addTagToDocument = useCallback(
    (docId: string, tag: string) => {
      setLibraryState(prev => ({
        ...prev,
        documents: prev.documents.map(doc =>
          doc.id === docId && !doc.tags.includes(tag)
            ? { ...doc, tags: [...doc.tags, tag] }
            : doc
        ),
      }));
    },
    [setLibraryState]
  );

  // Remove tag from document
  const removeTagFromDocument = useCallback(
    (docId: string, tag: string) => {
      setLibraryState(prev => ({
        ...prev,
        documents: prev.documents.map(doc =>
          doc.id === docId
            ? { ...doc, tags: doc.tags.filter(t => t !== tag) }
            : doc
        ),
      }));
    },
    [setLibraryState]
  );

  // Create collection
  const addCollection = useCallback(
    (name: string) => {
      const id = `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setLibraryState(prev => ({
        ...prev,
        collections: [...prev.collections, { id, name, count: 0 }],
      }));
      return id;
    },
    [setLibraryState]
  );

  // Update collection
  const updateCollection = useCallback(
    (id: string, name: string) => {
      setLibraryState(prev => ({
        ...prev,
        collections: prev.collections.map(col =>
          col.id === id ? { ...col, name } : col
        ),
      }));
    },
    [setLibraryState]
  );

  // Delete collection
  const deleteCollection = useCallback(
    (id: string) => {
      setLibraryState(prev => ({
        ...prev,
        collections: prev.collections.filter(col => col.id !== id),
        // Move documents from deleted collection to uncategorized
        documents: prev.documents.map(doc =>
          doc.collectionId === id ? { ...doc, collectionId: undefined } : doc
        ),
      }));
    },
    [setLibraryState]
  );

  return {
    documents: libraryState.documents,
    collections: libraryState.collections,
    processingFile,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocumentsByCollection,
    getUncategorizedDocuments,
    searchDocuments,
    addTagToDocument,
    removeTagFromDocument,
    addCollection,
    updateCollection,
    deleteCollection,
  };
}
