export function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <p className="text-xs text-foreground-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
