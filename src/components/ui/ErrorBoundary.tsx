import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-4">Something went wrong</h2>
          <p className="text-surface-500 dark:text-surface-400 mb-8 max-w-md">
            We encountered an unexpected error while loading this component. Please try again.
          </p>
          <button 
            onClick={this.handleRetry}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
