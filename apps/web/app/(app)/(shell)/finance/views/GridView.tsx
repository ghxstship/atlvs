'use client';

import { DataGrid } from '@ghxstship/ui';

export function GridView({ data, onRowClick }: any) {
  return <DataGrid data={data} onRowClick={onRowClick} />;
}
