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
    <Card className="hover:shadow-floating transition-shadow">
      <CardContent className="p-xl">
        <div className="flex gap-xl">
          <div className="w-component-lg h-component-lg bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Users className="h-icon-lg w-icon-lg color-accent" />
          </div>
          <div className="flex-1">
            <h3 className={`${anton.className} text-heading-4 text-heading-3 uppercase mb-xs`}>
              {leader.name}
            </h3>
            <p className="color-accent text-heading-4 mb-xs">{leader.role}</p>
            <div className="flex items-center gap-xl text-body-sm color-muted mb-sm">
              <MapPin className="h-3 w-3" />
              {leader.location}
            </div>
            <p className="color-muted mb-sm">{leader.bio}</p>
            
            <div className="flex gap-xl">
              {leader.social.linkedin && (
                <Button size="sm" variant="ghost" className="p-sm">
                  <Linkedin className="h-3 w-3" />
                </Button>
              )}
              {leader.social.twitter && (
                <Button size="sm" variant="ghost" className="p-sm">
                  <Twitter className="h-3 w-3" />
                </Button>
              )}
              {leader.social.github && (
                <Button size="sm" variant="ghost" className="p-sm">
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
