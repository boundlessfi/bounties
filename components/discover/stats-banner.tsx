import { cn } from '@/lib/utils';

export interface StatsBannerStat {
  label: string;
  value: string;
}

export interface StatsBannerProps {
  title: string;
  subtitle: string;
  /**
   * Optional until a trusted source for these figures exists. The banner is
   * deliberately shipped without them rather than showing invented numbers.
   */
  stats?: StatsBannerStat[];
  className?: string;
}

/**
 * Page banner for a discovery surface, ported from the main app's
 * `features/discover/components/landing/stats-banner.tsx`. It does the page
 * heading's job, which is why the title is an `h1` here while the main app
 * uses an `h2` (there the banner sits below a page-level heading).
 */
export function StatsBanner({
  title,
  subtitle,
  stats = [],
  className,
}: StatsBannerProps) {
  return (
    <section
      // A section with no accessible name is not exposed as a region, so it
      // would be skipped by screen reader landmark navigation.
      aria-label={title}
      className={cn(
        'relative isolate overflow-hidden rounded-[16px] border border-border bg-ink px-5 py-6 sm:px-8 sm:py-8',
        className
      )}
    >
      {/*
        Negative z-index inside the isolated stacking context paints this above
        the section's own background but below its content. Two stops rather
        than one: a single 8% tint was too faint to read as a glow against a
        page background that is the same colour as the banner.
      */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(72%_100%_at_86%_32%,var(--color-active-bg2)_0%,var(--color-active-bg)_38%,transparent_70%)]'
      />
      <div className='relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between'>
        <div className='max-w-2xl'>
          <h1 className='font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-[32px]'>
            {title}
          </h1>
          <p className='mt-2 text-sm text-muted-foreground sm:text-base'>
            {subtitle}
          </p>
        </div>
        {stats.length > 0 ? (
          <dl className='grid grid-cols-2 gap-6 sm:flex sm:gap-8'>
            {stats.map(stat => (
              <div key={stat.label}>
                <dd className='text-xl font-semibold text-foreground'>
                  {stat.value}
                </dd>
                <dt className='text-xs text-muted-foreground'>{stat.label}</dt>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}
