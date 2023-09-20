import { Signal } from '@preact/signals';
import { LogLine } from '@/utils/logger';

type LogsProps = {
  lines: Signal<LogLine[]>;
};

const colors = {
  info: 'text-black',
  warn: 'text-[#f5a623]',
  error: 'text-[#d0021b]',
};

export function Logs({ lines }: LogsProps) {
  const reversed = lines.value.slice().reverse();

  return (
    <pre class="leading-none text-xs max-h-[200px] bg-white overflow-y-scroll m-0 px-0 py-2.5 rounded-[10px]">
      {reversed.map((line, index) => (
        <span class={colors[line.type]} key={index}>
          #{line.index} {line.line}
          {'\n'}
        </span>
      ))}
    </pre>
  );
}
