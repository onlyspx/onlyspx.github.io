// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

async function parsePDF(file, summarize = false) {
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

        return processExtractedText(fullText, summarize);
    } catch (error) {
        console.error('Error parsing PDF:', error);
        throw new Error('Failed to parse PDF file');
    }
}

// Process the extracted text into a map of price ranges to notes
function processExtractedText(text, summarize = false) {
    const priceRangeMap = new Map();
    const lines = text.split('\n').map(line => cleanText(line));

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line || line.includes('WWW.EMINIPLAYER.NET')) continue;
        
        // Skip table headers and analysis sections
        const skipKeywords = [
            'Range Analysis',
            'Period',
            'Minimum',
            'Maximum',
            'Average',
            'Previous Day',
            'Regular Trading',
            '24-Hour Session',
            'Overnight',
            '1st Hour'
        ];
        if (skipKeywords.some(keyword => line.includes(keyword))) {
            continue;
        }

        const priceRanges = extractPriceRanges(line);
        if (priceRanges.length > 0) {
            // Start with the current line's notes (after removing price range)
            let notes = line
                .replace(/\b\d+(?:\.\d+)?(?:\s*[-–]\s*|\s+to\s+)\d+(?:\.\d+)?\b/g, '')
                .trim();
            
            // Collect continuation lines (lines without price ranges that follow)
            let j = i + 1;
            while (j < lines.length) {
                const nextLine = lines[j];
                // Stop if empty line or line contains a price range
                if (!nextLine || extractPriceRanges(nextLine).length > 0) {
                    break;
                }
                // Skip header/footer lines
                if (nextLine.includes('WWW.EMINIPLAYER.NET')) {
                    j++;
                    continue;
                }
                // Append continuation line
                notes += ' ' + nextLine;
                j++;
            }
            
            notes = notes.trim();
            
            if (notes) {
                const key = `${priceRanges[0].low}-${priceRanges[0].high}`;
                const noteData = {
                    fullText: notes.replace(/,/g, ' -'),
                    summary: summarizeNotes(notes)
                };
                priceRangeMap.set(key, summarize ? noteData.summary : noteData.fullText);
                console.log('Processed range:', key, '→', summarize ? noteData.summary : noteData.fullText);
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
        // Only accept valid price ranges:
        // 1. Both numbers must be valid
        // 2. Low must be less than high
        // 3. Both prices must be at least 1000 (realistic ES/NQ futures prices)
        // 4. Range must be reasonably small (< 100 points)
        if (!isNaN(low) && !isNaN(high) && 
            low < high && 
            low >= 1000 && 
            high >= 1000 &&
            (high - low) < 100) {
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
