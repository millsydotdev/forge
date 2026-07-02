import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../app/App';
import { ErrorBoundary } from '../app/components/ErrorBoundary';
const root = createRoot(document.getElementById('root')!);
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
