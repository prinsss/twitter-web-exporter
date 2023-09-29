import { Component } from 'preact';
import logger from '@/utils/logger';
import { ErrorIcon } from './icons';

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
