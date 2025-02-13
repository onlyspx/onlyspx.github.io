// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

async function parsePDF(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let fullText = '';

        // Extract text from each page
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            // Sort items by vertical position (y) to maintain reading order
            const sortedItems = textContent.items.sort((a, b) => {
                const yDiff = b.transform[5] - a.transform[5];
                return yDiff !== 0 ? yDiff : a.transform[4] - b.transform[4];
            });

            // Group items by line based on y-position
            let currentY = null;
            let currentLine = [];
            const lines = [];

            sortedItems.forEach(item => {
                const y = Math.round(item.transform[5]);
                if (currentY === null || Math.abs(y - currentY) > 2) {
                    if (currentLine.length > 0) {
                        lines.push(currentLine.join(' '));
                        currentLine = [];
                    }
                    currentY = y;
                }
                currentLine.push(item.str);
            });

            if (currentLine.length > 0) {
                lines.push(currentLine.join(' '));
            }

            fullText += lines.join('\n') + '\n';
        }

        return processExtractedText(fullText);
    } catch (error) {
        console.error('Error parsing PDF:', error);
        throw new Error('Failed to parse PDF file');
    }
}

// Process the extracted text into a map of price ranges to notes
function processExtractedText(text) {
    const priceRangeMap = new Map();
    const lines = text.split('\n').map(line => cleanText(line));

    for (const line of lines) {
        if (!line || line.includes('WWW.EMINIPLAYER.NET')) continue;

        const priceRanges = extractPriceRanges(line);
        if (priceRanges.length > 0) {
            const notes = line
                .replace(/\b\d+(?:\.\d+)?(?:\s*[-–]\s*|\s+to\s+)\d+(?:\.\d+)?\b/g, '')
                .trim();
            
            if (notes) {
                const key = `${priceRanges[0].low}-${priceRanges[0].high}`;
                const summary = summarizeNotes(notes);
                priceRangeMap.set(key, summary);
                console.log('Processed range:', key, '→', summary);
            }
        }
    }

    return priceRangeMap;
}

// Helper function to extract price ranges from text
function extractPriceRanges(text) {
    const priceRangeRegex = /\b(\d+(?:\.\d+)?)(?:\s*[-–]\s*|\s+to\s+)(\d+(?:\.\d+)?)\b/g;
    const matches = [];
    let match;

    while ((match = priceRangeRegex.exec(text)) !== null) {
        const low = parseFloat(match[1]);
        const high = parseFloat(match[2]);
        if (!isNaN(low) && !isNaN(high) && low < high) {
            matches.push({ low, high });
        }
    }

    return matches;
}

// Helper function to summarize notes
function summarizeNotes(notes) {
    const text = notes.toLowerCase();
    
    // Define zone types with full names
    const zoneTypes = [
        { pattern: 'initial resistance', name: 'Initial Resistance' },
        { pattern: 'initial support', name: 'Initial Support' },
        { pattern: 'pre-market resistance', name: 'Pre-market Resistance' },
        { pattern: 'pre market resistance', name: 'Pre-market Resistance' },
        { pattern: 'pre-market support', name: 'Pre-market Support' },
        { pattern: 'pre market support', name: 'Pre-market Support' },
        { pattern: 'range exhaustion', name: 'Range Exhaustion' },
        { pattern: 'range extreme', name: 'Range Extreme' },
        { pattern: 'bias changing', name: 'Bias Changing' },
        { pattern: 'bias confirming', name: 'Bias Confirming' }
    ];

    // Find zone type
    let zoneType = '';
    for (const type of zoneTypes) {
        if (text.includes(type.pattern)) {
            zoneType = type.name;
            break;
        }
    }

    // Extract direction
    let direction = '';
    if (text.includes('bullish')) direction = 'Bullish';
    else if (text.includes('bearish')) direction = 'Bearish';
    else if (text.includes('lower')) direction = 'Lower';
    else if (text.includes('higher')) direction = 'Higher';

    // Extract key actions
    let action = '';
    if (text.includes('break') || text.includes('breaking')) action = 'Break';
    else if (text.includes('hold')) action = 'Hold';
    else if (text.includes('reversal')) action = 'Reversal';

    // Combine components
    const parts = [];
    if (zoneType) parts.push(zoneType);
    
    // Combine action and direction
    const actionDirection = [action, direction].filter(Boolean).join(' ');
    if (actionDirection) {
        parts.push(actionDirection);
    }

    // If no specific components found, use cleaned original notes
    if (parts.length === 0) {
        const cleaned = notes
            .replace(/[,;]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        return cleaned.length > 50 ? cleaned.substring(0, 47) + '...' : cleaned;
    }

    return parts.join(': ');
}

// Helper function to clean and normalize text
function cleanText(text) {
    return text
        .replace(/\s+/g, ' ')
        .replace(/[^\x20-\x7E]/g, '') // Remove non-printable characters
        .trim();
}

// Helper function to find closest price range
function findClosestPriceRange(target, priceRangeMap, tolerance = 0.5) {
    const [targetLow, targetHigh] = target.split('-').map(Number);
    
    for (const [range] of priceRangeMap) {
        const [low, high] = range.split('-').map(Number);
        if (Math.abs(low - targetLow) <= tolerance && 
            Math.abs(high - targetHigh) <= tolerance) {
            return range;
        }
    }
    
    return null;
}
