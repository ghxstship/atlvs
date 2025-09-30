/**
 * '$dir' Template - Level 4
 */

import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface ${dir}Props {
  children: ReactNode;
  className?: string;
}

export const $dir: React.FC<${dir}Props> = ({ children, className }) => {
  return (
    <div className={cn('w-full', className)}>
      {children}
    </div>
  );
};
