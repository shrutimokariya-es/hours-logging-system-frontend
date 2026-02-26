export interface ReportData {
  title: string;
  dateRange: string;
  totalHours: number;
  totalClients: number;
  totalDevelopers: number;
  activities: Array<{
    project: string;
    clientName: string;
    developerName: string;
    hours: number;
    date: string;
    description?: string;
  }>;
  topClients: Array<{
    clientName: string;
    totalHours: number;
  }>;
}

export const generateCSVReport = (reportData: ReportData): string => {
  const lines: string[] = [];
  
  // Title and metadata
  lines.push(`"${reportData.title}"`);
  lines.push(`"Date Range: ${reportData.dateRange}"`);
  lines.push('');
  
  // Summary section
  lines.push('"Summary"');
  lines.push(`"Total Hours","${reportData.totalHours}"`);
  lines.push(`"Total Clients","${reportData.totalClients}"`);
  lines.push(`"Total Developers","${reportData.totalDevelopers}"`);
  lines.push('');
  
  // Activities section
  lines.push('"Recent Activities"');
  lines.push('"Project","Client","Developer","Hours","Date","Description"');
  
  reportData.activities.forEach(activity => {
    const description = (activity.description || '').replace(/"/g, '""');
    lines.push(
      `"${activity.project}","${activity.clientName}","${activity.developerName}","${activity.hours}","${activity.date}","${description}"`
    );
  });
  
  lines.push('');
  
  // Top clients section
  if (reportData.topClients.length > 0) {
    lines.push('"Top Clients"');
    lines.push('"Client Name","Total Hours"');
    
    reportData.topClients.forEach(client => {
      lines.push(`"${client.clientName}","${client.totalHours}"`);
    });
  }
  
  return lines.join('\n');
};

export const generateCSVTemplate = (): string => {
  const lines: string[] = [];
  
  lines.push('"Hour Logs Import Template"');
  lines.push('"Fill in the data below and upload to import multiple hour logs at once"');
  lines.push('');
  lines.push('"Instructions:"');
  lines.push('"1. Client Name: Enter the exact name of the client (must exist in system)"');
  lines.push('"2. Developer Name: Enter the exact name of the developer (must exist in system)"');
  lines.push('"3. Project: Enter project name (will be created if it doesn\'t exist)"');
  lines.push('"4. Date: Use YYYY-MM-DD format (e.g., 2024-01-15)"');
  lines.push('"5. Hours: Enter hours worked (e.g., 8 or 8.5)"');
  lines.push('"6. Description: Brief description of work done"');
  lines.push('');
  lines.push('"Client Name","Developer Name","Project","Date","Hours","Description"');
  
  // Add a few example rows
  lines.push('"Example Client","Example Developer","Example Project","2024-01-15","8","Completed feature implementation"');
  lines.push('"Example Client","Example Developer","Example Project","2024-01-16","4","Bug fixes and testing"');
  lines.push('');
  
  return lines.join('\n');
};

export const downloadCSVReport = (reportData: ReportData, filename: string = 'report.csv'): void => {
  const csvContent = generateCSVReport(reportData);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export const downloadCSVTemplate = (filename: string = 'hour-logs-import-template.csv'): void => {
  const csvContent = generateCSVTemplate();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
