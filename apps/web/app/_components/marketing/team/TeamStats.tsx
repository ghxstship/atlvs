import { typography } from '../../lib/typography';

interface Stat {
  metric: string;
  label: string;
  description: string;
}

interface TeamStatsProps {
  stats: Stat[];
}

export function TeamStats({ stats }: TeamStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-lg max-w-4xl mx-auto">
      {stats.map((stat) => (
        <div key={stat.metric} className="text-center">
          <div className={`${typography.statValue} mb-2`}>
            {stat.metric}
          </div>
          <div className="text-heading-4 color-foreground mb-1">{stat.label}</div>
          <div className="text-body-sm color-muted">{stat.description}</div>
        </div>
      ))}
    </div>
  );
}
