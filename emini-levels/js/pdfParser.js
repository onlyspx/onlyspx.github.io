// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const ROW_Y_TOLERANCE = 2;
const MIN_COLUMN_GAP = 8;
const COLUMN_GAP_MULTIPLIER = 2.25;
const COLUMN_POSITION_TOLERANCE = 2;

async function parsePDF(file, summarize = false) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const priceRangeMap = new Map();
        let carryLayout = null;

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            const page = await pdf.getPage(pageNumber);
            const textContent = await page.getTextContent();
            const rows = extractPageRows(textContent.items);
            const { priceRangeMap: pageMap, layout } = processPageRows(rows, summarize, carryLayout);
            carryLayout = layout;

            for (const [key, note] of pageMap) {
                priceRangeMap.set(key, note);
            }
        }

        return priceRangeMap;
    } catch (error) {
        console.error('Error parsing PDF:', error);
        throw new Error('Failed to parse PDF file');
    }
}

function extractPageRows(items) {
    const normalizedItems = items
        .map(item => normalizeTextItem(item))
        .filter(Boolean)
        .sort((a, b) => {
            const yDiff = b.y - a.y;
            return yDiff !== 0 ? yDiff : a.x - b.x;
        });

    const rows = [];
    let currentRow = null;

    normalizedItems.forEach(item => {
        if (!currentRow || Math.abs(item.y - currentRow.y) > ROW_Y_TOLERANCE) {
            currentRow = { y: item.y, items: [item] };
            rows.push(currentRow);
            return;
        }

        currentRow.items.push(item);
        currentRow.y = (currentRow.y + item.y) / 2;
    });

    return rows.map(row => ({
        y: row.y,
        items: row.items.sort((a, b) => a.x - b.x)
    }));
}

function normalizeTextItem(item) {
    const text = cleanText(item.str || '');
    if (!text) {
        return null;
    }

    const x = item.transform[4];
    const y = item.transform[5];
    const width = item.width || estimateTextWidth(text);
    const charWidth = width / Math.max(text.length, 1);

    return {
        text,
        x,
        y,
        width,
        endX: x + width,
        charWidth
    };
}

function processPageRows(rows, summarize = false, startingLayout = null) {
    const priceRangeMap = new Map();
    let currentEntry = null;
    let currentLayout = startingLayout;
    let tableActive = false;

    rows.forEach(row => {
        const cells = splitRowIntoCells(row.items);
        const rowText = cleanText(cells.map(cell => cell.text).join(' '));

        if (!rowText) {
            return;
        }

        if (rowText.includes('KEY ZONES')) {
            return;
        }

        if (isStopRow(rowText)) {
            flushZoneEntry(currentEntry, priceRangeMap, summarize);
            currentEntry = null;
            tableActive = false;
            return;
        }

        if (isZoneTableHeader(rowText)) {
            flushZoneEntry(currentEntry, priceRangeMap, summarize);
            currentEntry = null;
            currentLayout = extractColumnLayout(cells);
            tableActive = true;
            return;
        }

        if (!currentLayout || isNoiseRow(rowText)) {
            return;
        }

        const columns = assignCellsToColumns(cells, currentLayout);
        const rangeData = extractPriceRangeData(columns.zone);

        if (rangeData) {
            flushZoneEntry(currentEntry, priceRangeMap, summarize);
            currentEntry = {
                key: rangeData.key,
                effect: currentLayout.effectStart !== null
                    ? joinText(rangeData.remainder, columns.effect)
                    : columns.effect,
                notes: currentLayout.effectStart !== null
                    ? columns.notes
                    : joinText(rangeData.remainder, columns.notes)
            };
            tableActive = true;
            return;
        }

        if (tableActive && currentEntry) {
            currentEntry.effect = joinText(currentEntry.effect, columns.effect);
            currentEntry.notes = joinText(currentEntry.notes, columns.notes || columns.zone);
        }
    });

    flushZoneEntry(currentEntry, priceRangeMap, summarize);
    return {
        priceRangeMap,
        layout: currentLayout
    };
}

function splitRowIntoCells(items) {
    const cells = [];
    let currentCell = null;

    items.forEach(item => {
        if (!currentCell) {
            currentCell = createCell(item);
            cells.push(currentCell);
            return;
        }

        const gap = item.x - currentCell.endX;
        const threshold = Math.max(
            MIN_COLUMN_GAP,
            Math.max(currentCell.charWidth, item.charWidth) * COLUMN_GAP_MULTIPLIER
        );

        if (gap > threshold) {
            currentCell = createCell(item);
            cells.push(currentCell);
            return;
        }

        currentCell.text = cleanText(`${currentCell.text} ${item.text}`);
        currentCell.endX = Math.max(currentCell.endX, item.endX);
        currentCell.charWidth = (currentCell.charWidth + item.charWidth) / 2;
    });

    return cells
        .map(cell => ({
            x: cell.x,
            text: cleanText(cell.text)
        }))
        .filter(cell => cell.text);
}

function createCell(item) {
    return {
        x: item.x,
        endX: item.endX,
        charWidth: item.charWidth,
        text: item.text
    };
}

function extractColumnLayout(cells) {
    let effectStart = null;
    let notesStart = null;

    cells.forEach(cell => {
        const text = cell.text.toLowerCase();

        if (text.includes('effect')) {
            effectStart = cell.x;
        } else if (text.includes('notes')) {
            notesStart = cell.x;
        }
    });

    if (effectStart === null || notesStart === null) {
        return null;
    }

    return { effectStart, notesStart };
}

function assignCellsToColumns(cells, layout) {
    const zoneParts = [];
    const effectParts = [];
    const notesParts = [];

    cells.forEach(cell => {
        if (cell.x >= layout.notesStart - COLUMN_POSITION_TOLERANCE) {
            notesParts.push(cell.text);
        } else if (
            layout.effectStart !== null &&
            cell.x >= layout.effectStart - COLUMN_POSITION_TOLERANCE
        ) {
            effectParts.push(cell.text);
        } else {
            zoneParts.push(cell.text);
        }
    });

    return {
        zone: cleanText(zoneParts.join(' ')),
        effect: cleanText(effectParts.join(' ')),
        notes: cleanText(notesParts.join(' '))
    };
}

function flushZoneEntry(entry, priceRangeMap, summarize = false) {
    if (!entry) {
        return;
    }

    const note = buildZoneNote(entry.effect, entry.notes);
    if (!note) {
        return;
    }

    priceRangeMap.set(entry.key, summarize ? summarizeNotes(note) : note);
}

function buildZoneNote(effect, notes) {
    return sanitizeNote([effect, notes].filter(Boolean).join(' '));
}

function extractPriceRangeData(text) {
    if (!text) {
        return null;
    }

    const normalizedText = cleanText(text);
    const patterns = [
        {
            regex: /^(\d+(?:\.\d+)?)\s*[-]\s*(\d+(?:\.\d+)?)(.*)$/,
            remainderIndex: 3
        },
        {
            regex: /^(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)(.*)$/,
            remainderIndex: 3
        },
        {
            regex: /^(\d+(?:\.\d+)?)(.*)$/,
            remainderIndex: 2
        }
    ];

    for (const pattern of patterns) {
        const match = normalizedText.match(pattern.regex);
        if (!match) {
            continue;
        }

        const low = parseFloat(match[1]);
        const high = parseFloat(match[2] || match[1]);

        if (!isValidPriceRange(low, high)) {
            return null;
        }

        return {
            key: formatPriceRange(low, high),
            remainder: cleanText(match[pattern.remainderIndex] || '')
        };
    }

    return null;
}

function isValidPriceRange(low, high) {
    return Number.isFinite(low) &&
        Number.isFinite(high) &&
        low >= 1000 &&
        high >= 1000 &&
        low <= high &&
        (high - low) < 100;
}

function formatPriceRange(low, high) {
    return `${low.toFixed(2)}-${high.toFixed(2)}`;
}

function normalizePriceRangeString(range) {
    const parts = range.split('-').map(value => parseFloat(String(value).trim()));
    if (parts.length !== 2 || parts.some(value => !Number.isFinite(value))) {
        return null;
    }

    return formatPriceRange(parts[0], parts[1]);
}

function joinText(...parts) {
    return sanitizeNote(parts.filter(Boolean).join(' '));
}

function sanitizeNote(text) {
    return cleanText(text.replace(/WWW\s*\.?\s*EMINIPLAYER\s*\.?\s*NET/gi, ' '));
}

function isZoneTableHeader(text) {
    return /(?:Resistance|Support)/i.test(text) &&
        /\bEffect\b/i.test(text) &&
        /\bNotes\b/i.test(text);
}

function isStopRow(text) {
    return text.includes('10-Day Range Analysis') ||
        text.includes('Range Analysis') ||
        text.includes('Previous Day Summary');
}

function isNoiseRow(text) {
    const skipPatterns = [
        /^Period\b/i,
        /^Regular Trading\b/i,
        /^24-Hour Session\b/i,
        /^Overnight\b/i,
        /^1st Hour\b/i,
        /^Directional Bias\b/i,
        /^Economic Reports\b/i,
        /^High\b/i,
        /^Low\b/i,
        /^Close\b/i,
        /^VPOC\b/i,
        /^3PM CT Close\b/i,
        /^WWW\.?\s*EMINIPLAYER\.?\s*NET$/i
    ];

    return skipPatterns.some(pattern => pattern.test(text));
}

function estimateTextWidth(text) {
    return Math.max(text.length, 1) * 4;
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
        .replace(/[–—]/g, '-')
        .replace(/\s+/g, ' ')
        .replace(/[^\x20-\x7E]/g, '') // Remove non-printable characters
        .trim();
}

// Helper function to find closest price range
function findClosestPriceRange(target, priceRangeMap, tolerance = 0.5) {
    const normalizedTarget = normalizePriceRangeString(target);
    if (normalizedTarget && priceRangeMap.has(normalizedTarget)) {
        return normalizedTarget;
    }

    const [targetLow, targetHigh] = target.split('-').map(Number);
    let closestRange = null;
    let closestDistance = Number.POSITIVE_INFINITY;
    
    for (const [range] of priceRangeMap) {
        const [low, high] = range.split('-').map(Number);
        if (Math.abs(low - targetLow) <= tolerance && 
            Math.abs(high - targetHigh) <= tolerance) {
            const distance = Math.abs(low - targetLow) + Math.abs(high - targetHigh);
            if (distance < closestDistance) {
                closestRange = range;
                closestDistance = distance;
            }
        }
    }
    
    return closestRange;
}
