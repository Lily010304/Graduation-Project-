import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console for now; could integrate with a logger
    // eslint-disable-next-line no-console
    console.error('ScrollStack error boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          There was an error rendering this section. Please check the console for details.
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
