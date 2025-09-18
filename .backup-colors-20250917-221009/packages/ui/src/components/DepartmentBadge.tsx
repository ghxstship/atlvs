import React from 'react';
import { Badge, BadgeProps } from './Badge';

// GHXSTSHIP Department 3-Letter Codes
export type DepartmentCode = 
  | 'XLA' // Executive Leadership & Administration
  | 'FPL' // Finance, Procurement & Legal Services
  | 'CDS' // Creative Design & Strategy
  | 'EPR' // Event Programming & Revenue
  | 'MMM' // Marketing & Media Management
  | 'SED' // Site & Environmental Development
  | 'SOL' // Site Operations & Logistics
  | 'ITC' // IT & Communications
  | 'XTP' // Experiential & Technical Production
  | 'BGS' // Branding, Graphics & Signage
  | 'PSS' // Public Safety & Security
  | 'GSX' // Guest Services & Experience
  | 'HFB' // Hospitality, Food & Beverage
  | 'ENT' // Entertainment, Talent
  | 'TDX'; // Travel, Destinations, & Experiences

interface DepartmentBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  department: DepartmentCode;
  showFullName?: boolean;
}

const departmentConfig: Record<DepartmentCode, {
  name: string;
  color: 'primary' | 'success' | 'warning' | 'info' | 'destructive' | 'secondary' | 'muted';
  description: string;
}> = {
  XLA: { 
    name: 'Executive Leadership & Administration', 
    color: 'primary', 
    description: 'Strategic leadership and organizational management' 
  },
  FPL: { 
    name: 'Finance, Procurement & Legal Services', 
    color: 'success', 
    description: 'Financial operations and legal compliance' 
  },
  CDS: { 
    name: 'Creative Design & Strategy', 
    color: 'info', 
    description: 'Creative direction and strategic planning' 
  },
  EPR: { 
    name: 'Event Programming & Revenue', 
    color: 'warning', 
    description: 'Event planning and revenue generation' 
  },
  MMM: { 
    name: 'Marketing & Media Management', 
    color: 'info', 
    description: 'Marketing campaigns and media relations' 
  },
  SED: { 
    name: 'Site & Environmental Development', 
    color: 'success', 
    description: 'Site planning and environmental management' 
  },
  SOL: { 
    name: 'Site Operations & Logistics', 
    color: 'warning', 
    description: 'Operational logistics and site management' 
  },
  ITC: { 
    name: 'IT & Communications', 
    color: 'primary', 
    description: 'Technology infrastructure and communications' 
  },
  XTP: { 
    name: 'Experiential & Technical Production', 
    color: 'secondary', 
    description: 'Technical production and experiential design' 
  },
  BGS: { 
    name: 'Branding, Graphics & Signage', 
    color: 'destructive', 
    description: 'Brand identity and visual communications' 
  },
  PSS: { 
    name: 'Public Safety & Security', 
    color: 'muted', 
    description: 'Safety protocols and security operations' 
  },
  GSX: { 
    name: 'Guest Services & Experience', 
    color: 'success', 
    description: 'Guest relations and experience management' 
  },
  HFB: { 
    name: 'Hospitality, Food & Beverage', 
    color: 'warning', 
    description: 'Hospitality services and F&B operations' 
  },
  ENT: { 
    name: 'Entertainment, Talent', 
    color: 'secondary', 
    description: 'Entertainment programming and talent management' 
  },
  TDX: { 
    name: 'Travel, Destinations, & Experiences', 
    color: 'info', 
    description: 'Travel coordination and destination experiences' 
  },
};

export const DepartmentBadge = React.forwardRef<HTMLDivElement, DepartmentBadgeProps>(
  ({ department, showFullName = false, className, ...props }, ref) => {
    const config = departmentConfig[department];
    
    return (
      <Badge
        ref={ref}
        variant={config.color}
        className={className}
        title={config.description}
        {...props}
      >
        {showFullName ? config.name : department}
      </Badge>
    );
  }
);

DepartmentBadge.displayName = 'DepartmentBadge';

// Department Color Utility
export const getDepartmentColor = (department: DepartmentCode): string => {
  const colorMap: Record<typeof departmentConfig[DepartmentCode]['color'], string> = {
    primary: 'dept-xla',
    success: 'dept-fpl', 
    info: 'dept-mmm',
    warning: 'dept-epr',
    secondary: 'dept-xtp',
    destructive: 'dept-bgs',
    muted: 'dept-pss',
  };
  
  return colorMap[departmentConfig[department].color];
};

// Department Card Component
interface DepartmentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  department: DepartmentCode;
  children: React.ReactNode;
}

export const DepartmentCard = React.forwardRef<HTMLDivElement, DepartmentCardProps>(
  ({ department, children, className, ...props }, ref) => {
    const config = departmentConfig[department];
    
    return (
      <div
        ref={ref}
        className={`card border-l-4 border-l-${getDepartmentColor(department)} ${className || ''}`}
        title={config.description}
        {...props}
      >
        <div className="flex items-center justify-between mb-md">
          <DepartmentBadge department={department} />
          <span className="text-xs text-muted-foreground font-mono">
            {department}
          </span>
        </div>
        {children}
      </div>
    );
  }
);

DepartmentCard.displayName = 'DepartmentCard';

export { departmentConfig };
