/* ─────────────────────────────────────────────────────
 *  Error Boundary — Catches React render errors
 *  and shows a friendly fallback UI.
 *  v2: Animated entrance, better error display.
 * ───────────────────────────────────────────────────── */

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[Pawodoro] Error boundary caught:', error, info);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
          <div
            className="text-4xl mb-4"
            style={{ animation: 'onboardingPetEnter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
          >
            😵
          </div>
          <h2
            className="text-lg font-semibold text-white mb-2"
            style={{ animation: 'onboardingSlideIn 0.4s ease 0.1s both' }}
          >
            Something went wrong
          </h2>
          <p
            className="text-xs text-gray-400 mb-4 max-w-[260px]"
            style={{ animation: 'onboardingSlideIn 0.4s ease 0.2s both' }}
          >
            The app hit an unexpected error. This is likely a bug — sorry about that.
          </p>
          {this.state.error && (
            <details
              className="w-full mb-4"
              style={{ animation: 'onboardingSlideIn 0.4s ease 0.3s both' }}
            >
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300 transition-colors">
                Technical details
              </summary>
              <pre className="mt-2 text-[10px] text-red-400 bg-surface-2 rounded-lg p-2 overflow-x-auto text-left">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <div
            className="flex gap-2"
            style={{ animation: 'onboardingSlideIn 0.4s ease 0.4s both' }}
          >
            <button
              onClick={this.handleReset}
              className="btn-primary px-4 py-2 text-sm"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary px-4 py-2 text-sm"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
