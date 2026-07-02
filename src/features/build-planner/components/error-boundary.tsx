import React from 'react';

interface Props { children: React.ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) { return { error }; }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="error-boundary">
        <div className="error-boundary-inner">
          <span className="error-boundary-icon">⚠</span>
          <span className="error-boundary-title">Something went wrong</span>
          <span className="error-boundary-message">{this.state.error.message}</span>
          <button className="btn" onClick={() => this.setState({ error: null })}>Dismiss</button>
        </div>
      </div>
    );
  }
}
