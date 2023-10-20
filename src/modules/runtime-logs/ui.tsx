import { Fragment } from 'preact';
import { Signal } from '@preact/signals';
import { LogLine, logLinesSignal } from '@/utils/logger';

const colors = {
  info: 'text-base-content',
  warn: 'text-warning',
  error: 'text-error',
};

type LogsProps = {
  lines: Signal<LogLine[]>;
};

function Logs({ lines }: LogsProps) {
  const reversed = lines.value.slice().reverse();

  return (
    <pre class="leading-none text-xs max-h-48 bg-base-200 overflow-y-scroll m-0 px-1 py-2.5 no-scrollbar rounded-box-half">
      {reversed.map((line) => (
        <span class={colors[line.type]} key={line.index}>
          #{line.index} {line.line}
          {'\n'}
        </span>
      ))}
    </pre>
  );
}

export function RuntimeLogsPanel() {
  return (
    <Fragment>
      <div class="divider mt-0 mb-1"></div>
      <Logs lines={logLinesSignal} />
    </Fragment>
  );
}
