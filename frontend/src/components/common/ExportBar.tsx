import React, { useState } from 'react';
import { Download, FileText, CheckCircle } from 'lucide-react';
import { exportToCSV, downloadAsPDF } from '../../utils/exportUtils';

interface ExportBarProps {
    /** Rows to write to the CSV. If empty, CSV button is hidden. */
    csvRows?: Record<string, unknown>[];
    /** Base filename (no extension) for the CSV */
    csvFilename?: string;
    /** Title passed to the browser print dialog */
    pdfTitle?: string;
    /** Hide the PDF button entirely */
    hidePdf?: boolean;
    /** Hide the CSV button entirely */
    hideCsv?: boolean;
}

const ExportBar: React.FC<ExportBarProps> = ({
    csvRows,
    csvFilename = 'StratAxis_Export',
    pdfTitle,
    hidePdf = false,
    hideCsv = false,
}) => {
    const [csvFlash, setCsvFlash] = useState(false);
    const [pdfFlash, setPdfFlash] = useState(false);

    const handleCSV = () => {
        if (!csvRows?.length) return;
        exportToCSV(csvRows, csvFilename);
        setCsvFlash(true);
        setTimeout(() => setCsvFlash(false), 2500);
    };

    const handlePDF = () => {
        downloadAsPDF(pdfTitle);
        setPdfFlash(true);
        setTimeout(() => setPdfFlash(false), 2500);
    };

    return (
        <div className="flex items-center gap-3">
            {!hidePdf && (
                <button
                    onClick={handlePDF}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 ${pdfFlash
                            ? 'bg-semantic-success/10 text-semantic-success border-semantic-success/30'
                            : 'btn btn-outline'
                        }`}
                >
                    {pdfFlash ? <CheckCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    {pdfFlash ? 'Sent to Print' : 'Download PDF'}
                </button>
            )}
            {!hideCsv && csvRows?.length ? (
                <button
                    onClick={handleCSV}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 ${csvFlash
                            ? 'bg-semantic-success/10 text-semantic-success border-semantic-success/30'
                            : 'btn btn-outline'
                        }`}
                >
                    {csvFlash ? <CheckCircle className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                    {csvFlash ? 'Downloaded' : 'Export CSV'}
                </button>
            ) : null}
        </div>
    );
};

export default ExportBar;
