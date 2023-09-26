import { Component } from 'preact';
import logger from '@/utils/logger';

function ErrorIcon() {
  return (
    <svg class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(err: Error) {
    return { error: err.message };
  }

  componentDidCatch(err: Error) {
    logger.error(err.message, err);
    this.setState({ error: err.message });
  }

  render() {
    if (this.state.error) {
      return (
        <div class="alert alert-error p-2">
          <ErrorIcon />
          <div>
            <h3 class="font-bold leading-normal">Something went wrong.</h3>
            <p class="text-xs">Error: {this.state.error}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
