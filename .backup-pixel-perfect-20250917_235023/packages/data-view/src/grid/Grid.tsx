import * as React from 'react';

export type GridColumn<T> = {
  key: keyof T & string;
  label: string;
  width?: number | string;
};

export function Grid<T extends Record<string, any>>({
  columns,
  rows,
}: {
  columns: GridColumn<T>[];
  rows: T[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="sticky top-0">
            {columns.map((col) => (
              <th
                key={col.key}
                className="border-b border-border bg-muted/10 p-sm text-left font-medium text-muted-foreground/80 dark:border-border dark:bg-muted dark:text-muted-foreground/40"
                style={{ width: typeof col.width !== 'undefined' ? col.width : undefined }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-muted/10 dark:hover:bg-muted">
              {columns.map((col) => (
                <td key={col.key} className="border-b border-border p-sm dark:border-border">
                  {String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="p-lg text-center text-muted-foreground/60">
                No records.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
