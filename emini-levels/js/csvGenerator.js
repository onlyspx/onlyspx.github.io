function generateCSV(parsedData) {
    const levels = [];

    // Process resistance levels
    if (parsedData.resistance) {
        parsedData.resistance.forEach(entry => {
            entry.ranges.forEach(range => {
                levels.push({
                    low: range.low,
                    high: range.high,
                    notes: cleanNotes(entry.notes),
                    type: entry.type,
                    section: 'resistance'
                });
            });
        });
    }

    // Process support levels
    if (parsedData.support) {
        parsedData.support.forEach(entry => {
            entry.ranges.forEach(range => {
                levels.push({
                    low: range.low,
                    high: range.high,
                    notes: cleanNotes(entry.notes),
                    type: entry.type,
                    section: 'support'
                });
            });
        });
    }

    // Sort levels by price (ascending)
    levels.sort((a, b) => a.low - b.low);

    // Generate CSV string with headers
    const headers = ['low_price', 'high_price', 'notes', 'type', 'section'];
    const csvRows = [headers.join(',')];

    // Add data rows
    levels.forEach(level => {
        const row = [
            level.low,
            level.high,
            `"${level.notes}"`,
            level.type,
            level.section
        ];
        csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
}

// Helper function to clean notes
function cleanNotes(notes) {
    if (!notes) return '';
    
    return notes
        .replace(/"/g, '""') // Escape quotes
        .replace(/,/g, ';') // Replace commas with semicolons
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
}

// Export the generated CSV
function downloadCSV(csvContent, filename = 'emini-levels.csv') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
