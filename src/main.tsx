import { Component, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App Error Caught:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center mb-4">
            <span className="text-2xl font-bold">⏰</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">AuraWake System Notice</h1>
          <p className="text-sm text-stone-400 max-w-md mb-6">
            An unexpected error occurred while rendering. You can reload the app or reset the cache.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-xl text-sm font-semibold cursor-pointer"
            >
              Reload App
            </button>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-sm font-bold cursor-pointer"
            >
              Reset Storage & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
