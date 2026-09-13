export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-shark shadow-glow">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            d="M3 15c3.2 0 4.6-1.4 6.2-3.4L13 7c1.6-2 3.4-3 5.6-3-.3 2.4-1 4.3-2.3 5.9l1.9 1.1c.8.5 1.1 1.5.7 2.3-1.6 3.4-5 5.7-9 5.7H8l-1.6 2.4a1 1 0 0 1-1.8-.8L5.2 18c-1-.6-1.8-1.6-2.2-3Z"
            fill="oklch(0.16 0.05 160)"
          />
        </svg>
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-foreground">
        Shark<span className="text-primary">Zapp</span>
      </span>
    </span>
  );
}
