export default function MazeLegend() {
  return (
    <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
      <span className="flex items-center gap-1">
        <span className="inline-block h-4 w-4 rounded bg-emerald-500" />
        Start
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block h-4 w-4 rounded bg-red-500" />
        End
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block h-4 w-4 rounded bg-amber-400" />
        Solution
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block h-4 w-4 rounded bg-zinc-100 dark:bg-zinc-600" />
        Path
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block h-4 w-4 rounded bg-zinc-800 dark:bg-zinc-700" />
        Wall
      </span>
    </div>
  );
}
