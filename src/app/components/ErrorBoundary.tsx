import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] caught error:', error, errorInfo); // eslint-disable-line no-console
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: 'var(--wf-bg-darker)',
          color: 'var(--wf-text)',
          padding: 24,
          textAlign: 'center'
        }}>
          <h1 style={{ color: 'var(--wf-red)', marginBottom: 16 }}>An Error Occurred</h1>
          <p style={{ marginBottom: 24, color: 'var(--wf-text-dim)' }}>
            The application encountered an unexpected error.
          </p>
          {this.state.error && (
            <pre style={{
              backgroundColor: 'var(--wf-bg)',
              padding: 16,
              borderRadius: 4,
              overflowX: 'auto',
              maxWidth: '80%',
              textAlign: 'left',
              fontSize: 12,
              marginBottom: 24,
              color: 'var(--wf-text-dim)'
            }}>
              {this.state.error.toString()}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--wf-brand)',
              color: 'var(--wf-text)',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
