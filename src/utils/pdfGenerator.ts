import jsPDF from 'jspdf';

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

export class PDFGenerator {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  async generateReport(reportData: ReportData): Promise<void> {
    // Set font
    this.doc.setFont('helvetica');
    
    // Title
    this.doc.setFontSize(20);
    this.doc.text(reportData.title, 20, 30);
    
    // Date range
    this.doc.setFontSize(12);
    this.doc.text(`Date Range: ${reportData.dateRange}`, 20, 45);
    
    // Summary section
    this.doc.setFontSize(14);
    this.doc.text('Summary', 20, 65);
    
    this.doc.setFontSize(11);
    this.doc.text(`Total Hours: ${reportData.totalHours}`, 20, 80);
    this.doc.text(`Total Clients: ${reportData.totalClients}`, 20, 90);
    this.doc.text(`Total Developers: ${reportData.totalDevelopers}`, 20, 100);
    
    // Activities section
    this.doc.setFontSize(14);
    this.doc.text('Recent Activities', 20, 120);
    
    // Table headers
    this.doc.setFontSize(10);
    let yPos = 135;
    this.doc.text('Project', 20, yPos);
    this.doc.text('Client', 60, yPos);
    this.doc.text('Developer', 100, yPos);
    this.doc.text('Hours', 150, yPos);
    this.doc.text('Date', 180, yPos);
    
    yPos += 10;
    
    // Table data
    reportData.activities.forEach((activity, index) => {
      if (yPos > 270) {
        this.doc.addPage();
        yPos = 20;
      }
      
      this.doc.setFontSize(9);
      this.doc.text(activity.project.substring(0, 20), 20, yPos);
      this.doc.text(activity.clientName.substring(0, 15), 60, yPos);
      this.doc.text(activity.developerName.substring(0, 15), 100, yPos);
      this.doc.text(activity.hours.toString(), 150, yPos);
      this.doc.text(activity.date, 180, yPos);
      
      yPos += 8;
    });
    
    // Top clients section
    if (reportData.topClients.length > 0) {
      yPos += 15;
      if (yPos > 250) {
        this.doc.addPage();
        yPos = 20;
      }
      
      this.doc.setFontSize(14);
      this.doc.text('Top Clients', 20, yPos);
      
      yPos += 15;
      this.doc.setFontSize(10);
      
      reportData.topClients.forEach((client, index) => {
        if (yPos > 270) {
          this.doc.addPage();
          yPos = 20;
        }
        
        this.doc.text(`${index + 1}. ${client.clientName}: ${client.totalHours} hours`, 20, yPos);
        yPos += 8;
      });
    }
    
    // Footer
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
      this.doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 290, { align: 'center' });
    }
  }

  download(filename: string = 'report.pdf'): void {
    this.doc.save(filename);
  }

  getBlob(): Blob {
    return new Blob([this.doc.output('blob')], { type: 'application/pdf' });
  }
}

export const generatePDFReport = async (reportData: ReportData): Promise<Blob> => {
  const generator = new PDFGenerator();
  await generator.generateReport(reportData);
  return generator.getBlob();
};

export const downloadPDFReport = async (reportData: ReportData, filename?: string): Promise<void> => {
  const generator = new PDFGenerator();
  await generator.generateReport(reportData);
  generator.download(filename);
};
