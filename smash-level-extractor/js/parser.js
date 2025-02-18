class LevelParser {
    constructor() {
        console.log('LevelParser constructor called');
        // Patterns for different types of levels
        this.patterns = [
            {
                // Smashlevel pattern
                regex: /(?:smash\s*level|smashlevel)\s+(?:is\s+)?(?:at\s+)?(\d+(?:\.\d+)?)/i,
                noteTemplate: 'smashlevel'
            },
            {
                // Target patterns
                regex: /(?:target(?:ing)?|would\s+target)\s+(?:at\s+)?(\d+(?:\.\d+)?)/gi,
                getNote: (index, context) => {
                    if (context.toLowerCase().includes('final')) return 'final target';
                    if (context.toLowerCase().includes('potential')) return 'potential target';
                    return 'first target';
                }
            },
            {
                // General number pattern with context
                regex: /\b(\d+(?:\.\d+)?)\b/g,
                getNote: (_, context) => {
                    const lowerContext = context.toLowerCase();
                    if (lowerContext.includes('downside') || lowerContext.includes('selling')) {
                        if (lowerContext.includes('final')) return 'final downside target';
                        return 'downside target';
                    }
                    return null; // Skip if no clear context
                }
            }
        ];
    }

    parse(text) {
        const levels = new Map(); // Use Map to avoid duplicates

        // Process each pattern
        this.patterns.forEach(pattern => {
            let match;
            if (pattern.regex.flags.includes('g')) {
                // Reset regex if it's global
                pattern.regex.lastIndex = 0;
            }
            
            while ((match = pattern.regex.exec(text)) !== null) {
                const level = parseFloat(match[1]);
                if (!isNaN(level)) {
                    // Get surrounding context (100 chars before and after)
                    const start = Math.max(0, match.index - 100);
                    const end = Math.min(text.length, match.index + 100);
                    const context = text.slice(start, end);

                    // Get note based on pattern
                    const note = pattern.noteTemplate || pattern.getNote(match.index, context);
                    if (note) {
                        levels.set(level, note);
                    }
                }
            }
        });

        // Convert to array and sort by level
        return Array.from(levels.entries())
            .sort(([a], [b]) => a - b)
            .map(([level, note]) => `${level},${note}`);
    }
}

// Make sure LevelParser is available globally
try {
    window.LevelParser = LevelParser;
    console.log('LevelParser exported to window successfully');
} catch (error) {
    console.error('Failed to export LevelParser:', error);
    throw error;
}
