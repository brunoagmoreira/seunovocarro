// Utility function to export data to CSV
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  columns: { key: keyof T | ((item: T) => any); header: string }[],
  filename: string
) {
  if (data.length === 0) {
    return;
  }

  const headers = columns.map(col => col.header);
  
  const rows = data.map(item => 
    columns.map(col => {
      const value = typeof col.key === 'function' 
        ? col.key(item) 
        : item[col.key];
      
      // Handle null/undefined
      if (value === null || value === undefined) return '';
      
      // Convert to string and escape quotes
      const stringValue = String(value);
      
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    })
  );

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
