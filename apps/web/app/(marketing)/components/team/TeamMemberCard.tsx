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
    <Card className="text-center hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <h3 className={`${typography.cardTitle} mb-1`}>
          {member.name}
        </h3>
        <p className="text-sm font-semibold text-primary mb-1">{member.role}</p>
        <Badge variant="outline" className="text-xs mb-3">
          {member.department}
        </Badge>
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {member.location}
        </div>
      </CardContent>
    </Card>
  );
}
