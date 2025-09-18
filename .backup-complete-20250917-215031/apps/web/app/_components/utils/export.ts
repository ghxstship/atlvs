export const exportData = (data: any[], format: 'csv' | 'json' | 'xlsx') => {
  if (format === 'csv') {
    const csv = convertToCSV(data);
    downloadFile(csv, 'export.csv', 'text/csv');
  } else if (format === 'json') {
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, 'export.json', 'application/json');
  } else if (format === 'xlsx') {
    // For XLSX, you'd typically use a library like xlsx
    console.log('XLSX export requires additional library');
  }
};

const convertToCSV = (data: any[]) => {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
