import { Card, CardContent, Button } from '@ghxstship/ui';
import { MapPin, Users, Linkedin, Twitter, Github } from 'lucide-react';
import { typography } from '../../lib/typography';

interface Leader {
  name: string;
  role: string;
  bio: string;
  location: string;
  image?: string;
  social: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

interface LeadershipCardProps {
  leader: Leader;
}

export function LeadershipCard({ leader }: LeadershipCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-8">
        <div className="flex gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className={`${typography.cardTitle} mb-1`}>
              {leader.name}
            </h3>
            <p className="text-primary font-semibold mb-2">{leader.role}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <MapPin className="h-3 w-3" />
              {leader.location}
            </div>
            <p className="text-muted-foreground mb-4">{leader.bio}</p>
            
            <div className="flex gap-2">
              {leader.social.linkedin && (
                <Button size="sm" variant="ghost" className="p-2">
                  <Linkedin className="h-3 w-3" />
                </Button>
              )}
              {leader.social.twitter && (
                <Button size="sm" variant="ghost" className="p-2">
                  <Twitter className="h-3 w-3" />
                </Button>
              )}
              {leader.social.github && (
                <Button size="sm" variant="ghost" className="p-2">
                  <Github className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
