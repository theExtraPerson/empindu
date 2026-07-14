export default function Loading() {
  return (
    <section className="min-h-screen bg-background px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 h-40 animate-pulse border-2 border-foreground bg-muted shadow-brutal" />
        <div className="mb-6 h-16 animate-pulse border-2 border-foreground bg-muted" />
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[420px] animate-pulse border-2 border-foreground bg-muted shadow-brutal"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
