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
            const sortedItems = textContent.items.sort((a, b) => 
                b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4]
            );

            // Group items by line based on y-position
            let currentY = null;
            let currentLine = [];
            const lines = [];

            sortedItems.forEach(item => {
                const y = Math.round(item.transform[5]);
                if (currentY === null) {
                    currentY = y;
                }

                // If y position changes significantly, start a new line
                if (Math.abs(y - currentY) > 2) {
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

    // Split text into lines and process each line
    const lines = text.split('\n').map(line => cleanText(line));

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Skip empty lines and headers
        if (!line || line.includes('WWW.EMINIPLAYER.NET')) {
            continue;
        }

        // Detect section changes
        if (line.toLowerCase().includes('resistance notes')) {
            currentSection = 'resistance';
            continue;
        } else if (line.toLowerCase().includes('support notes')) {
            currentSection = 'support';
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
                buffer.push(line);
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
    const priceRangeRegex = /\b\d+(?:\.\d+)?(?:\s*-\s*|\s+to\s+)\d+(?:\.\d+)?\b/;
    return priceRangeRegex.test(text);
}

// Helper function to extract price ranges from text
function extractPriceRanges(text) {
    const priceRangeRegex = /\b(\d+(?:\.\d+)?)(?:\s*-\s*|\s+to\s+)(\d+(?:\.\d+)?)\b/g;
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
    const lowerDesc = description.toLowerCase();
    const types = [
        { pattern: 'initial resistance', type: 'ir' },
        { pattern: 'initial support', type: 'is' },
        { pattern: 'range extreme', type: 'rex' },
        { pattern: 'range exhaustion', type: 'reh' },
        { pattern: 'bias changing', type: 'bcz' },
        { pattern: 'bias confirming', type: 'bcoz' },
        { pattern: 'pre-market resistance', type: 'pmr' },
        { pattern: 'pre-market support', type: 'pms' },
        { pattern: 'important', type: 'Strong' }
    ];

    for (const { pattern, type } of types) {
        if (lowerDesc.includes(pattern)) {
            return type;
        }
    }

    return 'Normal';
}

// Process a complete entry (price range + notes)
function processEntry(text) {
    const priceRanges = extractPriceRanges(text);
    const notes = text.replace(/\b\d+(?:\.\d+)?(?:\s*-\s*|\s+to\s+)\d+(?:\.\d+)?\b/g, '').trim();
    
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
