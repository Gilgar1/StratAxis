/**
 * Utility helpers for client-side CSV export and PDF download.
 * PDF download uses browser print-to-PDF so no extra library is needed.
 */

// ──────────────────────────────────────────
// CSV export
// ──────────────────────────────────────────

/**
 * Convert an array of objects to CSV text.
 */
function objectsToCSV(rows: Record<string, unknown>[]): string {
    if (!rows.length) return '';
    const headers = Object.keys(rows[0]);
    const escape = (v: unknown) => {
        const str = String(v ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };
    const lines = [
        headers.join(','),
        ...rows.map(row => headers.map(h => escape(row[h])).join(',')),
    ];
    return lines.join('\n');
}

/**
 * Trigger a browser download of a CSV file.
 * @param rows     Array of plain objects (one per row)
 * @param filename Desired filename (without extension)
 */
export function exportToCSV(rows: Record<string, unknown>[], filename: string) {
    const csv = objectsToCSV(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ──────────────────────────────────────────
// PDF "download" via print dialog
// ──────────────────────────────────────────

/**
 * Open the browser's native print dialog, pre-set to "Save as PDF".
 * The caller optionally provides a custom page title.
 */
export function downloadAsPDF(pageTitle?: string) {
    const originalTitle = document.title;
    if (pageTitle) document.title = pageTitle;
    window.print();
    // Restore after a tick so the dialog has time to capture the title
    setTimeout(() => {
        document.title = originalTitle;
    }, 500);
}
