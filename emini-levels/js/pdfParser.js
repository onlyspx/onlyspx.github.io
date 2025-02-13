// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

async function parsePDF(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let fullText = '';

        // Extract text from each page with position information
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            // Sort items by vertical position (y) to maintain reading order
            // For same y, sort by x to maintain left-to-right order
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
                
                // If this is the first item or y position is significantly different
                if (currentY === null || Math.abs(y - currentY) > 2) {
                    if (currentLine.length > 0) {
                        lines.push(currentLine.join(' '));
                        currentLine = [];
                    }
                    currentY = y;
                }

                currentLine.push(item.str);
            });

            // Add last line if exists
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

// Process the extracted text into structured data
function processExtractedText(text) {
    const sections = {
        resistance: [],
        support: []
    };
    
    let currentSection = null;
    let buffer = [];
    let isFirstEntry = true;

    // Split text into lines and process each line
    const lines = text.split('\n').map(line => cleanText(line));

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Skip empty lines and headers
        if (!line || line.includes('WWW.EMINIPLAYER.NET')) {
            continue;
        }

        // Special handling for the first entry if it contains a price range
        if (isFirstEntry && containsPriceRange(line)) {
            // Assume it's resistance if not clearly marked
            currentSection = 'resistance';
            sections[currentSection].push(processEntry(line));
            isFirstEntry = false;
            continue;
        }
        isFirstEntry = false;

        // Detect section changes
        if (line.toLowerCase().includes('resistance notes')) {
            currentSection = 'resistance';
            buffer = [];
            continue;
        } else if (line.toLowerCase().includes('support notes')) {
            currentSection = 'support';
            buffer = [];
            continue;
        }

        if (currentSection && line.trim()) {
            // If line contains a price range, process the buffer
            if (containsPriceRange(line)) {
                if (buffer.length > 0) {
                    sections[currentSection].push(processEntry(buffer.join(' ')));
                }
                buffer = [line];
            } else {
                // Check if this line might be a continuation of a price range line
                const previousLine = buffer[buffer.length - 1] || '';
                if (containsPriceRange(previousLine)) {
                    // This line is probably part of the notes for the previous price range
                    buffer.push(line);
                } else {
                    buffer.push(line);
                }
            }
        }
    }

    // Process last buffer if exists
    if (buffer.length > 0 && currentSection) {
        sections[currentSection].push(processEntry(buffer.join(' ')));
    }

    return sections;
}

// Helper function to check if a line contains a price range
function containsPriceRange(text) {
    // More flexible price range detection
    const priceRangeRegex = /\b\d+(?:\.\d+)?(?:\s*[-–]\s*|\s+to\s+)\d+(?:\.\d+)?\b/;
    return priceRangeRegex.test(text);
}

// Helper function to extract price ranges from text
function extractPriceRanges(text) {
    // More flexible price range detection
    const priceRangeRegex = /\b(\d+(?:\.\d+)?)(?:\s*[-–]\s*|\s+to\s+)(\d+(?:\.\d+)?)\b/g;
    const matches = [];
    let match;

    while ((match = priceRangeRegex.exec(text)) !== null) {
        const low = parseFloat(match[1]);
        const high = parseFloat(match[2]);
        
        // Validate price range
        if (!isNaN(low) && !isNaN(high) && low < high) {
            matches.push({ low, high });
        }
    }

    return matches;
}

// Helper function to determine zone type from description
function determineZoneType(description) {
    // Simple substring checks for exact matches
    const text = description.toLowerCase();
    
    // Check for Initial Resistance/Support first
    if (text.includes('initial resistance')) return 'ir';
    if (text.includes('initial support')) return 'is';
    
    // Then check for other specific types
    if (text.includes('range extreme')) return 'rex';
    if (text.includes('range exhaustion')) return 'reh';
    if (text.includes('bias changing')) return 'bcz';
    if (text.includes('bias confirming')) return 'bcoz';
    if (text.includes('pre-market resistance') || text.includes('premarket resistance')) return 'pmr';
    if (text.includes('pre-market support') || text.includes('premarket support')) return 'pms';
    
    // Check for abbreviated forms
    if (text.includes(' ir ') || text.includes('(ir)') || text.includes('[ir]')) return 'ir';
    if (text.includes(' is ') || text.includes('(is)') || text.includes('[is]')) return 'is';
    
    // Check for importance last
    if (text.includes('important')) return 'Strong';
    
    return 'Normal';
}

// Process a complete entry (price range + notes)
function processEntry(text) {
    const priceRanges = extractPriceRanges(text);
    // Remove price ranges and clean up the remaining text for notes
    const notes = text
        .replace(/\b\d+(?:\.\d+)?(?:\s*[-–]\s*|\s+to\s+)\d+(?:\.\d+)?\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    
    return {
        ranges: priceRanges,
        notes: notes,
        type: determineZoneType(text)
    };
}

// Helper function to clean and normalize text
function cleanText(text) {
    return text
        .replace(/\s+/g, ' ')
        .replace(/[^\x20-\x7E]/g, '') // Remove non-printable characters
        .trim();
}
