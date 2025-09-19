import React from 'react';

export interface SidebarLandmarksProps {
  landmarks: Array<{
    id: string;
    label: string;
    href: string;
  }>;
}

export const SidebarLandmarks: React.FC<SidebarLandmarksProps> = ({ landmarks }) => {
  return (
    <nav aria-label="Landmarks" className="sidebar-landmarks">
      {landmarks.map((landmark: any) => (
        <a key={landmark.id} href={landmark.href} className="landmark-link">
          {landmark.label}
        </a>
      ))}
    </nav>
  );
};
