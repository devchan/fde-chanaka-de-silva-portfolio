export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-strong" />
      <div className="mt-6 h-28 animate-pulse rounded-lg bg-surface" />
      <div className="mt-5 grid gap-5 md:grid-cols-3">
        <div className="h-44 animate-pulse rounded-lg bg-surface" />
        <div className="h-44 animate-pulse rounded-lg bg-surface" />
        <div className="h-44 animate-pulse rounded-lg bg-surface" />
      </div>
    </div>
  );
}
