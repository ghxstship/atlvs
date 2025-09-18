import React from 'react';

export interface AnimationOptimizerProps {
  children: React.ReactNode;
  reducedMotion?: boolean;
}

export const AnimationOptimizer: React.FC<AnimationOptimizerProps> = ({ 
  children, 
  reducedMotion = false 
}) => {
  return (
    <div className={`animation-optimizer ${reducedMotion ? 'reduced-motion' : ''}`}>
      {children}
    </div>
  );
};
