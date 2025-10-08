import { validateCreateProfile, type CreateProfileInput } from './validations';

export interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string; data?: unknown }>;
  imported: unknown[];
}

export async function importProfiles(file: File, format: 'csv' | 'json'): Promise<ImportResult> {
  const content = await file.text();
  
  switch (format) {
    case 'csv':
      return parseCSV(content);
    case 'json':
      return parseJSON(content);
    default:
      throw new Error(`Unsupported import format: ${format}`);
  }
}

export function parseCSV(content: string): ImportResult {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    return { success: 0, failed: 0, errors: [], imported: [] };
  }

  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  const result: ImportResult = {
    success: 0,
    failed: 0,
    errors: [],
    imported: []
  };

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCSVLine(lines[i]);
      const row: Record<string, unknown> = {};
      
      headers.forEach((header, index) => {
        if (values[index] !== undefined) {
          row[header] = values[index];
        }
      });

      // Validate the row
      const validated = validateImportRow(row);
      result.imported.push(validated);
      result.success++;
    } catch (error) {
      result.failed++;
      result.errors.push({
        row: i + 1,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: lines[i]
      });
    }
  }

  return result;
}

export function parseJSON(content: string): ImportResult {
  const result: ImportResult = {
    success: 0,
    failed: 0,
    errors: [],
    imported: []
  };

  try {
    const data = JSON.parse(content);
    const rows = Array.isArray(data) ? data : [data];

    rows.forEach((row, index) => {
      try {
        const validated = validateImportRow(row);
        result.imported.push(validated);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: index + 1,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: row
        });
      }
    });
  } catch (error) {
    result.failed++;
    result.errors.push({
      row: 0,
      error: `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }

  return result;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

export function validateImportRow(row: Record<string, unknown>): CreateProfileInput {
  // Parse arrays from strings if needed
  if (typeof row.skills === 'string') {
    row.skills = row.skills.split(';').map(s => s.trim()).filter(Boolean);
  }
  if (typeof row.achievements === 'string') {
    row.achievements = row.achievements.split(';').map(s => s.trim()).filter(Boolean);
  }

  return validateCreateProfile(row);
}
