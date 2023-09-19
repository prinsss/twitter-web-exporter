import { Signal } from '@preact/signals';
import { LogLine } from '@/utils/logger';
import './logs.less';

type LogsProps = {
  lines: Signal<LogLine[]>;
  type?: string;
};

export function Logs({ lines, type = 'info' }: LogsProps) {
  const reversed = lines.value.slice().reverse();

  return (
    <pre class={`logs ${type}`}>
      {reversed.map((line, index) => (
        <span class={line.type} key={index}>
          #{line.index} {line.line}
          {'\n'}
        </span>
      ))}
    </pre>
  );
}
