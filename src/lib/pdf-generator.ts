// PDF Report Generator - Clinical-Grade Reports

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDFReportData } from '@/types';
import { BRADEN_SUBSCALES, RISK_CLASSIFICATIONS } from './braden-scale';
import { format } from 'date-fns';

export function generatePDFReport(data: PDFReportData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = 20;
  
  // Colors based on risk level
  const riskColors: Record<string, [number, number, number]> = {
    veryHigh: [220, 38, 38],
    high: [234, 88, 12],
    moderate: [245, 158, 11],
    mild: [132, 204, 22],
    none: [34, 197, 94],
  };
  
  // Header
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Braden Scale Assessment Report', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(data.facilityName, pageWidth / 2, 25, { align: 'center' });
  
  yPosition = 45;
  doc.setTextColor(0, 0, 0);
  
  // Report Generation Info
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Report Generated: ${format(new Date(data.generatedAt), 'PPpp')}`, margin, yPosition);
  yPosition += 10;
  
  // Patient Information Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text('Patient Information', margin, yPosition);
  yPosition += 8;
  
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  const patientInfo = [
    ['Name:', data.patient.name, 'MRN:', data.patient.medicalRecordNumber || 'N/A'],
    ['Date of Birth:', format(new Date(data.patient.dateOfBirth), 'PP'), 'Age:', `${data.patient.age} years`],
    ['Sex:', data.patient.sex.charAt(0).toUpperCase() + data.patient.sex.slice(1), 'Room:', data.patient.roomNumber || 'N/A'],
    ['Care Setting:', formatCareSetting(data.patient.careSetting), 'Admission:', format(new Date(data.patient.admissionDate), 'PP')],
    ['Diagnosis:', data.patient.diagnosis || 'Not specified', '', ''],
  ];
  
  patientInfo.forEach((row) => {
    doc.setFont('helvetica', 'bold');
    doc.text(row[0], margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(row[1], margin + 35, yPosition);
    
    if (row[2]) {
      doc.setFont('helvetica', 'bold');
      doc.text(row[2], pageWidth / 2 + 10, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(row[3], pageWidth / 2 + 35, yPosition);
    }
    yPosition += 6;
  });
  
  yPosition += 5;
  
  // Assessment Date
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Assessment Date: ${format(new Date(data.assessment.date), 'PPpp')}`, margin, yPosition);
  if (data.assessorName) {
    doc.text(`Assessed By: ${data.assessorName}`, pageWidth / 2, yPosition);
  }
  yPosition += 12;
  
  // Braden Score Table
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text('Braden Scale Scores', margin, yPosition);
  yPosition += 8;
  
  const scoreData = BRADEN_SUBSCALES.map((subscale) => {
    const score = data.assessment.scores[subscale.id as keyof typeof data.assessment.scores];
    const option = subscale.options.find((o) => o.score === score);
    return [
      subscale.name,
      `${score} / ${subscale.maxScore}`,
      option?.label || '-',
    ];
  });
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Subscale', 'Score', 'Rating']],
    body: scoreData,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 10;
  
  // Total Score and Risk Level Box
  const riskClass = RISK_CLASSIFICATIONS[data.assessment.riskLevel];
  const riskColor = riskColors[data.assessment.riskLevel];
  
  doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.roundedRect(margin, yPosition, pageWidth - margin * 2, 25, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Braden Score: ${data.assessment.totalScore}`, margin + 10, yPosition + 10);
  doc.text(`Risk Level: ${riskClass.label}`, margin + 10, yPosition + 19);
  doc.text(`(Score Range: ${riskClass.scoreRange})`, pageWidth - margin - 50, yPosition + 15);
  
  yPosition += 35;
  
  // AI Recommendations
  doc.setTextColor(30, 64, 175);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('AI-Generated Prevention Plan', margin, yPosition);
  yPosition += 8;
  
  doc.setDrawColor(30, 64, 175);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;
  
  // Primary Concerns
  if (data.aiAnalysis.primaryConcerns.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text('Primary Risk Factors:', margin, yPosition);
    yPosition += 6;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    data.aiAnalysis.primaryConcerns.forEach((concern) => {
      doc.text(`• ${concern}`, margin + 5, yPosition);
      yPosition += 5;
    });
    yPosition += 5;
  }
  
  // Key Recommendations
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Recommended Interventions:', margin, yPosition);
  yPosition += 6;
  
  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }
  
  const recommendationData = data.aiAnalysis.recommendations
    .slice(0, 8) // Limit to top 8 recommendations for space
    .map((rec) => [
      rec.category,
      getPriorityLabel(rec.priority),
      rec.recommendation,
    ]);
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Category', 'Priority', 'Recommendation']],
    body: recommendationData,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 30, fontStyle: 'bold' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
    didParseCell: function(data) {
      if (data.column.index === 1 && data.section === 'body') {
        const priority = data.cell.raw as string;
        if (priority === 'CRITICAL') {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        } else if (priority === 'HIGH') {
          data.cell.styles.textColor = [234, 88, 12];
        }
      }
    },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 10;
  
  // Key Care Parameters
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFillColor(240, 249, 255);
  doc.roundedRect(margin, yPosition, pageWidth - margin * 2, 20, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text(`Repositioning: ${data.aiAnalysis.repositioningFrequency}`, margin + 5, yPosition + 8);
  doc.text(`Mattress: ${data.aiAnalysis.mattressRecommendation.substring(0, 60)}...`, margin + 5, yPosition + 15);
  
  yPosition += 30;
  
  // Trend Analysis (if available)
  if (data.trendAnalysis) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('Trend Analysis', margin, yPosition);
    yPosition += 8;
    
    const trendColor = data.trendAnalysis.trend === 'improving' ? [34, 197, 94] :
                       data.trendAnalysis.trend === 'deteriorating' ? [220, 38, 38] :
                       [100, 100, 100];
    
    doc.setTextColor(trendColor[0], trendColor[1], trendColor[2]);
    doc.setFontSize(11);
    doc.text(`Status: ${data.trendAnalysis.trend.toUpperCase()}`, margin, yPosition);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Based on ${data.trendAnalysis.assessmentCount} assessments`, margin + 80, yPosition);
    yPosition += 6;
    doc.text(data.trendAnalysis.recommendation, margin, yPosition, {
      maxWidth: pageWidth - margin * 2,
    });
    yPosition += 15;
  }
  
  // Signature Section
  if (yPosition > 230) {
    doc.addPage();
    yPosition = 20;
  }
  
  yPosition = Math.max(yPosition, 230);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text('Signatures', margin, yPosition);
  yPosition += 10;
  
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  
  // Nurse Signature
  doc.line(margin, yPosition + 15, margin + 70, yPosition + 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('Nurse Signature', margin, yPosition + 20);
  doc.text('Date: _______________', margin, yPosition + 26);
  
  // Supervisor Signature
  doc.line(pageWidth / 2, yPosition + 15, pageWidth / 2 + 70, yPosition + 15);
  doc.text('Supervisor Signature', pageWidth / 2, yPosition + 20);
  doc.text('Date: _______________', pageWidth / 2, yPosition + 26);
  
  yPosition += 35;
  
  // Disclaimer
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(margin, yPosition, pageWidth - margin * 2, 25, 2, 2, 'F');
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(146, 64, 14);
  doc.text('IMPORTANT DISCLAIMER', margin + 5, yPosition + 6);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const disclaimer = data.aiAnalysis.disclaimer;
  const lines = doc.splitTextToSize(disclaimer, pageWidth - margin * 2 - 10);
  doc.text(lines, margin + 5, yPosition + 12);
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount} | Braden Scale Calculator | ${format(new Date(), 'PP')}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  return doc;
}

function formatCareSetting(setting: string): string {
  switch (setting) {
    case 'hospital': return 'Hospital';
    case 'nursingHome': return 'Nursing Home';
    case 'homeCare': return 'Home Care';
    default: return setting;
  }
}

function getPriorityLabel(priority: string): string {
  switch (priority) {
    case 'critical': return 'CRITICAL';
    case 'high': return 'HIGH';
    case 'medium': return 'MEDIUM';
    case 'low': return 'LOW';
    default: return priority.toUpperCase();
  }
}

export function downloadPDF(doc: jsPDF, patientName: string): void {
  const filename = `Braden_Assessment_${patientName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd_HHmm')}.pdf`;
  doc.save(filename);
}

export function printPDF(doc: jsPDF): void {
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url);
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}
