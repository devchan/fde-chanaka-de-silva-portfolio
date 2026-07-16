import { Reveal } from "@/components/motion/reveal";

/**
 * Illustrative contribution graph (53 weeks x 7 days) generated with a seeded
 * PRNG so server and client render identically.
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const levels = [
  "fill-[var(--surface-strong)]",
  "fill-emerald-900/70 dark:fill-emerald-900",
  "fill-emerald-700",
  "fill-emerald-500",
  "fill-emerald-400",
];

export function GithubGraph() {
  const rand = mulberry32(20260716);
  const weeks = Array.from({ length: 53 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const r = rand();
      // Weekdays are busier; weekends lighter.
      const weekday = d > 0 && d < 6;
      const intensity = r * (weekday ? 1 : 0.55) + (w > 40 ? 0.12 : 0);
      if (intensity < 0.25) return 0;
      if (intensity < 0.45) return 1;
      if (intensity < 0.65) return 2;
      if (intensity < 0.85) return 3;
      return 4;
    })
  );

  const cell = 11;
  const gap = 3;

  return (
    <Reveal>
      <div className="glass overflow-x-auto rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-sm font-medium">
            1,847 contributions in the last year
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            Less
            {levels.map((l, i) => (
              <svg key={i} width={10} height={10} aria-hidden>
                <rect width={10} height={10} rx={2} className={l} />
              </svg>
            ))}
            More
          </div>
        </div>
        <svg
          width={53 * (cell + gap)}
          height={7 * (cell + gap)}
          role="img"
          aria-label="GitHub contribution activity graph"
          className="min-w-full"
        >
          {weeks.map((week, w) =>
            week.map((level, d) => (
              <rect
                key={`${w}-${d}`}
                x={w * (cell + gap)}
                y={d * (cell + gap)}
                width={cell}
                height={cell}
                rx={2.5}
                className={levels[level]}
              />
            ))
          )}
        </svg>
      </div>
    </Reveal>
  );
}
