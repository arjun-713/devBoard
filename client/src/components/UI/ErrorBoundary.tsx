import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: unknown): void {
    console.error('View crashed inside ErrorBoundary', error);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-border bg-bg-surface p-6 text-center">
          <AlertTriangle size={20} className="mx-auto text-brand-pumpkin" />
          <h3 className="mt-3 text-[15px] font-semibold text-text-primary">Something went wrong</h3>
          <p className="mt-1 text-[12px] text-[#555550]">An unexpected error occurred in this view.</p>
          <Button className="mt-4" onClick={this.handleRetry}>
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
