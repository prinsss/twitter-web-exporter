import { Component } from 'preact';
import { IconExclamationCircle } from '@tabler/icons-preact';
import { Trans } from '@/i18n';
import logger from '@/utils/logger';

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
          <IconExclamationCircle />
          <div>
            <h3 class="font-bold leading-normal">
              <Trans ns="common" i18nKey="Something went wrong." />
            </h3>
            <p class="text-xs">
              <Trans ns="common" i18nKey="Error:" /> {this.state.error}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
