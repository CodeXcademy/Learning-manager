import { lazy, Suspense, ComponentType, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

// Generic loading skeleton for heavy components
function LoadingSkeleton({ height = 'h-64', message = 'Loading...' }: { height?: string; message?: string }) {
  return (
    <div className={`${height} w-full flex items-center justify-center bg-surface-container-low rounded-xl border border-outline-variant/10`}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-xs text-on-surface-variant font-medium">{message}</p>
      </div>
    </div>
  );
}

// PDF Viewer loading skeleton
function PDFLoadingSkeleton() {
  return (
    <div className="flex-1 w-full flex flex-col items-center gap-4 py-8">
      <LoadingSkeleton height="h-[600px]" message="Loading PDF viewer..." />
    </div>
  );
}

// Video Player loading skeleton  
function VideoLoadingSkeleton() {
  return (
    <div className="aspect-video w-full bg-surface-container-low rounded-xl border border-outline-variant/10 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-on-surface-variant font-medium">Loading video player...</p>
      </div>
    </div>
  );
}

// Markdown Editor loading skeleton
function EditorLoadingSkeleton() {
  return (
    <div className="flex-1 w-full flex flex-col">
      <div className="h-10 bg-surface-container rounded-t-lg border border-outline-variant/10 border-b-0" />
      <div className="flex-1 min-h-[300px] bg-surface-container-low rounded-b-lg border border-outline-variant/10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <p className="text-xs text-on-surface-variant font-medium">Loading editor...</p>
        </div>
      </div>
    </div>
  );
}

// Lazy-loaded PDF components
export const LazyDocument = lazy(() => 
  import('react-pdf').then(module => ({ default: module.Document }))
);

export const LazyPage = lazy(() => 
  import('react-pdf').then(module => ({ default: module.Page }))
);

// Lazy-loaded Markdown Editor
export const LazyMDEditor = lazy(() => 
  import('@uiw/react-md-editor').then(module => ({ default: module.default }))
);

// Lazy-loaded Video Player (Vidstack)
export const LazyMediaPlayer = lazy(() => 
  import('@vidstack/react').then(module => ({ default: module.MediaPlayer }))
);

export const LazyMediaProvider = lazy(() => 
  import('@vidstack/react').then(module => ({ default: module.MediaProvider }))
);

// Wrapper components with Suspense boundaries

interface LazyPDFViewerProps {
  file: string;
  onLoadSuccess?: (pdf: { numPages: number }) => void;
  numPages?: number;
  scale?: number;
  children?: ReactNode;
}

export function LazyPDFViewer({ file, onLoadSuccess, numPages = 0, scale = 1, children }: LazyPDFViewerProps) {
  return (
    <Suspense fallback={<PDFLoadingSkeleton />}>
      <LazyDocument
        file={file}
        onLoadSuccess={onLoadSuccess}
        className="flex flex-col items-center gap-4"
        loading={<PDFLoadingSkeleton />}
      >
        {children || (
          Array.from(new Array(numPages), (_, index) => (
            <div key={`page_${index + 1}`} className="bg-white rounded-lg shadow-xl overflow-hidden">
              <LazyPage
                pageNumber={index + 1}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </div>
          ))
        )}
      </LazyDocument>
    </Suspense>
  );
}

interface LazyVideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  className?: string;
  children?: ReactNode;
}

export function LazyVideoPlayer({ src, title, poster, className, children }: LazyVideoPlayerProps) {
  return (
    <Suspense fallback={<VideoLoadingSkeleton />}>
      <LazyMediaPlayer
        src={src}
        title={title}
        poster={poster}
        className={className}
        playsInline
      >
        <Suspense fallback={null}>
          <LazyMediaProvider />
        </Suspense>
        {children}
      </LazyMediaPlayer>
    </Suspense>
  );
}

interface LazyMarkdownEditorProps {
  value: string;
  onChange: (value?: string) => void;
  height?: string | number;
  preview?: 'edit' | 'live' | 'preview';
  className?: string;
  textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
  previewOptions?: Record<string, unknown>;
  hideToolbar?: boolean;
}

export function LazyMarkdownEditor(props: LazyMarkdownEditorProps) {
  return (
    <Suspense fallback={<EditorLoadingSkeleton />}>
      <LazyMDEditor {...props} />
    </Suspense>
  );
}

// HOC for lazy loading any component
export function withLazyLoad<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback: ReactNode = <LoadingSkeleton />
) {
  const LazyComponent = lazy(importFn);
  
  return function LazyWrapper(props: P) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Export loading skeletons for external use
export { LoadingSkeleton, PDFLoadingSkeleton, VideoLoadingSkeleton, EditorLoadingSkeleton };
