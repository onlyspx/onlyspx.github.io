// This file is kept for potential future enhancements but its functionality
// has been moved to main.js for the current use case where we need to
// preserve the exact TXT file format and only update zone types.

// Helper function to clean notes (kept for reference)
function cleanNotes(notes) {
    if (!notes) return '';
    
    return notes
        .replace(/"/g, '""') // Escape quotes
        .replace(/,/g, ';') // Replace commas with semicolons
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
}
