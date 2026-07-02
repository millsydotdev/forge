import React from 'react';
import { ErrorBoundary } from '../features/build-planner/components/error-boundary';
import { WorkspaceShell } from './WorkspaceShell';

export function App() {
  return (
    <ErrorBoundary>
      <WorkspaceShell />
    </ErrorBoundary>
  );
}
