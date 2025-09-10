import { Card, CardContent } from '@ghxstship/ui/components/Card';
import { Badge } from '@ghxstship/ui/components/Badge';
import { cn } from '@ghxstship/ui/system';
import { LucideIcon } from 'lucide-react';
import { typography } from '../../lib/typography';

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  badge?: string;
  gradient?: string;
  className?: string;
  variant?: 'default' | 'hover' | 'compact';
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  badge,
  gradient = 'from-primary to-accent',
  className,
  variant = 'default'
}: FeatureCardProps) {
  const variants = {
    default: 'p-6',
    hover: 'p-6 group hover:shadow-lg transition-all duration-300 hover:-translate-y-1',
    compact: 'p-4',
  };

  return (
    <Card className={cn(variants[variant], className)}>
      <CardContent className="p-0">
        {Icon && (
          <div className={cn(
            'inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4',
            `bg-gradient-to-r ${gradient}`
          )}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        )}
        
        {badge && (
          <Badge variant="secondary" className="mb-3">
            {badge}
          </Badge>
        )}
        
        <h3 className={cn(typography.cardTitle, 'mb-3')}>
          {title}
        </h3>
        
        <p className={typography.bodyMedium}>
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

interface StatsCardProps {
  value: string;
  label: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
  className?: string;
}

export function StatsCard({
  value,
  label,
  icon: Icon,
  trend,
  className
}: StatsCardProps) {
  return (
    <Card className={cn('p-6 text-center', className)}>
      <CardContent className="p-0">
        {Icon && (
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        )}
        
        <div className={cn(typography.statValue, 'mb-2')}>
          {value}
        </div>
        
        <div className={typography.statLabel}>
          {label}
        </div>
        
        {trend && (
          <div className={cn(
            'text-sm font-medium mt-2',
            trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
          )}>
            {trend.direction === 'up' ? '↗' : '↘'} {trend.value}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company?: string;
  avatar?: string;
  className?: string;
}

export function TestimonialCard({
  quote,
  author,
  role,
  company,
  avatar,
  className
}: TestimonialCardProps) {
  return (
    <Card className={cn('p-6', className)}>
      <CardContent className="p-0">
        <blockquote className="text-lg mb-6 italic">
          "{quote}"
        </blockquote>
        
        <div className="flex items-center gap-4">
          {avatar && (
            <img
              src={avatar}
              alt={author}
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          
          <div>
            <div className="font-semibold">{author}</div>
            <div className="text-sm text-muted-foreground">
              {role}{company && ` at ${company}`}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
