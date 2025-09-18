export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export const applySorting = <T>(data: T[], sorts: SortConfig[]): T[] => {
  if (!sorts.length) return data;
  
  return [...data].sort((a, b) => {
    for (const sort of sorts) {
      const aVal = (a as any)[sort.field];
      const bVal = (b as any)[sort.field];
      
      let comparison = 0;
      
      if (aVal < bVal) comparison = -1;
      else if (aVal > bVal) comparison = 1;
      
      if (comparison !== 0) {
        return sort.direction === 'desc' ? -comparison : comparison;
      }
    }
    
    return 0;
  });
};
