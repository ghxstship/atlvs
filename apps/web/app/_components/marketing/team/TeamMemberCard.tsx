import { Card, CardContent, Badge } from '@ghxstship/ui';
import { MapPin, Users } from 'lucide-react';
import { typography } from '../../lib/typography';

interface TeamMember {
  name: string;
  role: string;
  department: string;
  location: string;
  image?: string;
}

interface TeamMemberCardProps {
  member: TeamMember;
  variant?: 'default' | 'compact';
}

export function TeamMemberCard({ member, variant = 'default' }: TeamMemberCardProps) {
  return (
    <Card className="text-center hover:shadow-floating transition-shadow">
      <CardContent className="p-lg">
        <div className="w-component-lg h-component-lg bg-gradient-to-br from-primary/20 to-accent/20 rounded-full mx-auto mb-sm flex items-center justify-center">
          <Users className="h-icon-md w-icon-md color-accent" />
        </div>
        <h3 className={`${anton.className} text-heading-4 text-heading-3 uppercase mb-xs`}>
          {member.name}
        </h3>
        <p className="text-body-sm text-heading-4 color-accent mb-xs">{member.role}</p>
        <Badge variant="outline" className="text-body-sm mb-sm">
          {member.department}
        </Badge>
        <div className="flex items-center justify-center gap-xs text-body-sm color-muted">
          <MapPin className="h-3 w-3" />
          {member.location}
        </div>
      </CardContent>
    </Card>
  );
}
