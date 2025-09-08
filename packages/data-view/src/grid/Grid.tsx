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
                className="border-b border-zinc-200 bg-zinc-50 p-2 text-left font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                style={{ width: typeof col.width !== 'undefined' ? col.width : undefined }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
              {columns.map((col) => (
                <td key={col.key} className="border-b border-zinc-100 p-2 dark:border-zinc-900">
                  {String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="p-6 text-center text-zinc-500">
                No records.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
