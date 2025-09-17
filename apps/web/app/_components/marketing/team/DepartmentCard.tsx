import { Card, CardContent, Badge } from '@ghxstship/ui';
import { Users } from 'lucide-react';
import { typography } from '../../../../(marketing)/lib/typography';

interface Department {
  name: string;
  count: number;
  description: string;
  leads: string[];
  color: string;
}

interface DepartmentCardProps {
  department: Department;
}

export function DepartmentCard({ department }: DepartmentCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className={`w-12 h-12 bg-gradient-to-r ${department.color} rounded-lg flex items-center justify-center mb-4`}>
          <Users className="h-6 w-6 text-background" />
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <h3 className={`${typography.cardTitle} text-heading-4`}>
            {department.name}
          </h3>
          <Badge variant="outline" className="text-body-sm">
            {department.count} members
          </Badge>
        </div>
        
        <p className="color-muted mb-4">{department.description}</p>
        
        <div>
          <h4 className="text-body-sm text-heading-4 color-muted mb-2 uppercase">Team Leads</h4>
          <div className="space-y-1">
            {department.leads.map((lead) => (
              <div key={lead} className="text-body-sm color-foreground">{lead}</div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
