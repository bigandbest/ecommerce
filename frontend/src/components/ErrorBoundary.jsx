"use client";
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Only log errors in development
    if (process.env.NODE_ENV === "development") {
      console.warn("ErrorBoundary caught an error:", error, errorInfo);
    }

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI - you can customize this
      return (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-600">
            We're working to fix this issue. Please try refreshing the page.
          </p>
          {process.env.NODE_ENV === "development" && (
            <details className="mt-4 text-xs text-gray-500">
              <summary>Error Details (Development)</summary>
              <pre className="mt-2 p-2 bg-red-50 rounded text-red-700 overflow-auto">
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          <button
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              window.location.reload();
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
