import React from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { FileText, Download, Printer } from 'lucide-react';

const ExportReporting: React.FC = () => {
  const reports = [
    { title: 'Full Market Report (Q4 2025)', type: 'PDF', size: '2.4 MB', date: 'Jan 15, 2026' },
    { title: 'Douala Land Price Index CSV', type: 'CSV', size: '45 KB', date: 'Feb 05, 2026' },
    { title: 'Yaoundé Rental Yield Analysis', type: 'PDF', size: '1.8 MB', date: 'Feb 01, 2026' },
  ];

  return (
    <AuthenticatedLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2">Export & Reporting</h1>
        <p className="text-primary-600 dark:text-primary-400 mb-8">Download comprehensive analyses and raw data for offline use.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {reports.map((report, idx) => (
            <div key={idx} className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-primary-100 dark:bg-primary-800 rounded-lg">
                    <FileText className="w-6 h-6 text-primary-600 dark:text-primary-300" />
                  </div>
                  <span className="text-xs font-bold bg-primary-200 dark:bg-primary-800 text-primary-800 dark:text-primary-200 px-2 py-1 rounded uppercase">{report.type}</span>
                </div>
                <h3 className="font-bold text-primary-900 dark:text-white mb-2">{report.title}</h3>
                <p className="text-sm text-primary-500">Generated on {report.date} • {report.size}</p>
              </div>
              <button className="btn btn-outline w-full mt-6 flex items-center justify-center">
                <Download className="w-4 h-4 mr-2" /> Download
              </button>
            </div>
          ))}
        </div>

        <div className="bg-primary-900 text-white p-8 rounded-xl flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg mb-2">Custom Report Generator</h3>
            <p className="text-primary-300 text-sm max-w-lg">Need a specific cut of the data? Generate a custom PDF report focusing on specific neighborhoods or property types.</p>
          </div>
          <button className="btn btn-gold">Create New Report</button>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default ExportReporting;
