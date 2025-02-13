class LevelParser {
    constructor() {
        // Patterns for different types of levels
        this.patterns = [
            {
                // Smashlevel pattern
                regex: /smashlevel\s+(?:is\s+)?(?:at\s+)?(\d+(?:\.\d+)?)/i,
                noteTemplate: 'smashlevel'
            },
            {
                // Target patterns
                regex: /target\s+(?:at\s+)?(\d+(?:\.\d+)?)/gi,
                getNote: (index, context) => {
                    if (context.includes('final')) return 'final target';
                    if (context.includes('potential')) return 'potential target';
                    return 'first target';
                }
            },
            {
                // General number pattern with context
                regex: /\b(\d+(?:\.\d+)?)\b/g,
                getNote: (_, context) => {
                    if (context.includes('downside') || context.includes('selling')) {
                        if (context.includes('final')) return 'final downside target';
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
                    // Get surrounding context (50 chars before and after)
                    const start = Math.max(0, match.index - 50);
                    const end = Math.min(text.length, match.index + 50);
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

// Export for use in main.js
window.LevelParser = LevelParser;
