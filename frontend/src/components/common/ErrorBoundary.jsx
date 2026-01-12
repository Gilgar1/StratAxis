import React, { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong</h2>
                    <p className="text-gray-600 mb-6">We apologize for the inconvenience. Please try refreshing the page.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
