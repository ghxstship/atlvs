export const handleImport = (
  files: FileList | null,
  onSuccess: (data: any[]) => void,
  onError: (error: string) => void
) => {
  if (!files || files.length === 0) {
    onError('No file selected');
    return;
  }
  
  const file = files[0];
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      let importedData: any[];
      
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        importedData = JSON.parse(content);
      } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        importedData = parseCSV(content);
      } else {
        throw new Error('Unsupported file format');
      }
      
      if (!Array.isArray(importedData)) {
        throw new Error('Invalid data format');
      }
      
      onSuccess(importedData);
    } catch (error) {
      onError(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  reader.onerror = () => {
    onError('Failed to read file');
  };
  
  reader.readAsText(file);
};

const parseCSV = (content: string): any[] => {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const data = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    return obj;
  });
  
  return data;
};
