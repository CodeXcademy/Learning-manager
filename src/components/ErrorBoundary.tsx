import React, { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch React errors and dynamic import failures
 * Provides graceful error handling and recovery options
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-lg p-8 max-w-md w-full border border-outline-variant/20">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="w-12 h-12 text-error" />
            </div>
            
            <h1 className="text-xl font-bold text-on-surface text-center mb-2">
              Oops! Something went wrong
            </h1>
            
            <p className="text-sm text-on-surface-variant text-center mb-4">
              The application encountered an error loading a module. This usually happens when:
            </p>
            
            <ul className="text-xs text-on-surface-variant space-y-2 mb-6 bg-surface p-3 rounded border border-outline-variant/10">
              <li>• Development server connection was lost</li>
              <li>• A module failed to load</li>
              <li>• Browser cache needs clearing</li>
            </ul>

            {this.state.error && (
              <details className="mb-6 text-xs">
                <summary className="cursor-pointer text-on-surface-variant hover:text-on-surface mb-2">
                  Error details
                </summary>
                <pre className="bg-surface p-2 rounded border border-outline-variant/20 text-error overflow-auto max-h-32">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <div className="space-y-2">
              <button
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Application
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-surface-container text-on-surface py-2 rounded-lg font-medium hover:bg-surface-container-high transition-colors"
              >
                Go Home
              </button>
            </div>

            <p className="text-xs text-on-surface-variant text-center mt-4">
              If this persists, try clearing your browser cache or checking your internet connection.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
