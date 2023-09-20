export function Loading() {
  return (
    <div class="animate-spin duration-[0.75s] w-6 h-6">
      <svg height="100%" viewBox="0 0 32 32" width="100%">
        <circle
          cx="16"
          cy="16"
          fill="none"
          r="14"
          stroke-width="4"
          style="stroke: rgb(29, 155, 240); opacity: 0.2;"
        ></circle>
        <circle
          cx="16"
          cy="16"
          fill="none"
          r="14"
          stroke-width="4"
          style="stroke: rgb(29, 155, 240); stroke-dasharray: 80; stroke-dashoffset: 60;"
        ></circle>
      </svg>
    </div>
  );
}
