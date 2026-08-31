import { cn } from "@/lib/utils";

export interface StatsBannerStat {
  label: string;
  value: string;
}

export interface StatsBannerProps {
  title: string;
  subtitle: string;
  stats?: StatsBannerStat[];
  className?: string;
}

/** A reusable discover banner. Stats are optional until a trusted source exists. */
export function StatsBanner({
  title,
  subtitle,
  stats = [],
  className,
}: StatsBannerProps) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-[16px] border border-border bg-ink px-5 py-6 sm:px-8 sm:py-8",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,var(--color-active-bg),transparent_60%)]"
      />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-[32px]">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {subtitle}
          </p>
        </div>
        {stats.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 sm:flex sm:gap-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-xl font-semibold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
