export async function exportProfiles(data: Record<string, unknown>[], format: 'csv' | 'json' | 'xlsx') {
  switch (format) {
    case 'csv':
      return exportToCSV(data);
    case 'json':
      return exportToJSON(data);
    case 'xlsx':
      return exportToExcel(data);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

export function exportToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';

  // Get headers from first object
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');

  // Convert data to CSV rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Handle arrays and objects
      if (Array.isArray(value)) {
        return `"${value.join('; ')}"`;
      }
      if (typeof value === 'object' && value !== null) {
        return `"${JSON.stringify(value)}"`;
      }
      // Escape quotes and wrap in quotes if contains comma
      const stringValue = String(value ?? '');
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}

export function exportToJSON(data: Record<string, unknown>[]): string {
  return JSON.stringify(data, null, 2);
}

export function exportToExcel(data: Record<string, unknown>[]): string {
  // For Excel, we'll return CSV format which Excel can open
  // In a real implementation, you'd use a library like xlsx
  return exportToCSV(data);
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportProfilesAsCSV(data: Record<string, unknown>[]) {
  const csv = exportToCSV(data);
  const filename = `profiles_export_${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(csv, filename, 'text/csv');
}

export function exportProfilesAsJSON(data: Record<string, unknown>[]) {
  const json = exportToJSON(data);
  const filename = `profiles_export_${new Date().toISOString().split('T')[0]}.json`;
  downloadFile(json, filename, 'application/json');
}
