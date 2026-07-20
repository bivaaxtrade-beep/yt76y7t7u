import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// Keeping it as a Class Component as it's the standard way to implement Error Boundaries in React.
// Simplified the implementation slightly to ensure no conflicts.
export default class AppBoundary extends Component<Props, State> {
  public props: Props;
  public state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-[#1c1d22]">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-xl">
            <h2 className="text-xl font-bold text-red-500 mb-4 tracking-tight">Application Error</h2>
            <p className="text-gray-400 text-sm mb-4">
              We encountered an unexpected error while rendering this component.
            </p>
            <div className="bg-black/50 p-4 rounded-xl overflow-auto max-h-[200px] text-left">
              <code className="text-xs text-red-400 font-mono">
                {this.state.error?.message || "Unknown error"}
              </code>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 bg-[#323338] hover:bg-[#3A3C42] text-white px-6 py-2 rounded-xl transition-colors text-sm font-bold"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
