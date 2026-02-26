import React, { useState } from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { FileText, Download, CheckCircle } from 'lucide-react';
import { exportToCSV, downloadAsPDF } from '../utils/exportUtils';

interface ReportMeta {
  title: string;
  type: 'PDF' | 'CSV';
  size: string;
  date: string;
  csvData?: Record<string, unknown>[];
}

const REPORTS: ReportMeta[] = [
  {
    title: 'Full Market Report (Q4 2025)',
    type: 'PDF',
    size: '2.4 MB',
    date: 'Jan 15, 2026',
  },
  {
    title: 'Douala Land Price Index',
    type: 'CSV',
    size: '45 KB',
    date: 'Feb 05, 2026',
    csvData: [
      { Neighborhood: 'Akwa', City: 'Douala', 'Median Price/m² (XAF)': 118500, Listings: 28, Confidence: 'High' },
      { Neighborhood: 'Bonapriso', City: 'Douala', 'Median Price/m² (XAF)': 97632, Listings: 16, Confidence: 'High' },
      { Neighborhood: 'Bonanjo', City: 'Douala', 'Median Price/m² (XAF)': 108200, Listings: 12, Confidence: 'High' },
      { Neighborhood: 'Makepe', City: 'Douala', 'Median Price/m² (XAF)': 52932, Listings: 15, Confidence: 'Medium' },
      { Neighborhood: 'Logbaba', City: 'Douala', 'Median Price/m² (XAF)': 41000, Listings: 9, Confidence: 'Medium' },
      { Neighborhood: 'Kotto', City: 'Douala', 'Median Price/m² (XAF)': 35000, Listings: 7, Confidence: 'Low' },
    ],
  },
  {
    title: 'Yaoundé Rental Yield Analysis',
    type: 'PDF',
    size: '1.8 MB',
    date: 'Feb 01, 2026',
  },
  {
    title: 'Combined Rental Dataset (2024-2025)',
    type: 'CSV',
    size: '82 KB',
    date: 'Jan 28, 2026',
    csvData: [
      { City: 'Douala', Neighborhood: 'Akwa', 'Housing Type': 'Studio', Year: 2024, 'Median Rent (XAF)': 85000, Confidence: 'High' },
      { City: 'Douala', Neighborhood: 'Bonapriso', 'Housing Type': '1 Bedroom', Year: 2024, 'Median Rent (XAF)': 120000, Confidence: 'High' },
      { City: 'Yaoundé', Neighborhood: 'Bastos', 'Housing Type': 'Villa/House', Year: 2025, 'Median Rent (XAF)': 450000, Confidence: 'High' },
      { City: 'Yaoundé', Neighborhood: 'Nlongkak', 'Housing Type': '2 Bedrooms', Year: 2025, 'Median Rent (XAF)': 130000, Confidence: 'Medium' },
    ],
  },
];

const ExportReporting: React.FC = () => {
  const [downloaded, setDownloaded] = useState<number[]>([]);

  const handleDownload = (report: ReportMeta, idx: number) => {
    if (report.type === 'CSV' && report.csvData) {
      exportToCSV(report.csvData, `StratAxis_${report.title.replace(/\s+/g, '_')}`);
    } else {
      // For PDF reports use the browser print dialog
      downloadAsPDF(`StratAxis – ${report.title}`);
    }
    setDownloaded(prev => [...prev, idx]);
    setTimeout(() => setDownloaded(prev => prev.filter(i => i !== idx)), 3000);
  };

  const handleCustomReport = () => {
    downloadAsPDF('StratAxis – Custom Market Report');
  };

  return (
    <AuthenticatedLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2">Export &amp; Reporting</h1>
        <p className="text-primary-600 dark:text-primary-400 mb-8">Download comprehensive analyses and raw data for offline use.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
          {REPORTS.map((report, idx) => (
            <div key={idx} className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-primary-100 dark:bg-primary-800 rounded-lg">
                    <FileText className="w-6 h-6 text-primary-600 dark:text-primary-300" />
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${report.type === 'CSV'
                      ? 'bg-semantic-success/10 text-semantic-success'
                      : 'bg-primary-200 dark:bg-primary-800 text-primary-800 dark:text-primary-200'
                    }`}>
                    {report.type}
                  </span>
                </div>
                <h3 className="font-bold text-primary-900 dark:text-white mb-2">{report.title}</h3>
                <p className="text-sm text-primary-500">Generated on {report.date} • {report.size}</p>
              </div>
              <button
                onClick={() => handleDownload(report, idx)}
                className={`w-full mt-6 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 border ${downloaded.includes(idx)
                    ? 'bg-semantic-success/10 text-semantic-success border-semantic-success/30'
                    : 'btn btn-outline'
                  }`}
              >
                {downloaded.includes(idx) ? (
                  <>
                    <CheckCircle className="w-4 h-4" /> Downloaded
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    {report.type === 'CSV' ? 'Download CSV' : 'Download PDF'}
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="bg-primary-900 text-white p-8 rounded-xl flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg mb-2">Custom Report Generator</h3>
            <p className="text-primary-300 text-sm max-w-lg">
              Generate a custom PDF report of the current page. Use your browser's "Save as PDF" option in the print dialog.
            </p>
          </div>
          <button onClick={handleCustomReport} className="btn btn-gold whitespace-nowrap">
            Create New Report
          </button>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default ExportReporting;
