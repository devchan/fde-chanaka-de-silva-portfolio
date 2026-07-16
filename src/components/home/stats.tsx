import { stats } from "@/data/site";
import { Counter } from "@/components/motion/counter";
import { Reveal } from "@/components/motion/reveal";

export function Stats() {
  return (
    <section aria-label="Career statistics" className="mx-auto max-w-6xl px-6">
      <div className="glass grid grid-cols-2 gap-px overflow-hidden rounded-2xl md:grid-cols-4">
        {stats.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.08}>
            <div className="flex flex-col items-center gap-1 px-6 py-8">
              <Counter
                value={stat.value}
                suffix={stat.suffix}
                className="text-4xl font-bold tracking-normal text-gradient md:text-5xl"
              />
              <p className="text-center text-sm text-muted">{stat.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
