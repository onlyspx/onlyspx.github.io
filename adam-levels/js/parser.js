class AdamLevelsParser {
    constructor() {
        this.levels = [];
    }

    parseLevels(text) {
        const lines = text.split('\n');
        const levels = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Check if line contains levels
            if (line.includes('are:')) {
                const levelsText = line.split('are:')[1].trim();
                const levelsList = levelsText.split(',');

                levelsList.forEach(item => {
                    const levelText = item.trim();
                    if (!levelText) return;

                    // Check if it's a major level
                    const isMajor = levelText.includes('(major)');
                    // Extract the numeric level
                    const level = parseFloat(levelText.replace('(major)', ''));

                    if (!isNaN(level)) {
                        levels.push({
                            level,
                            major: isMajor,
                            context: ''
                        });
                    }
                });
            }
        }

        // Sort levels in descending order
        levels.sort((a, b) => b.level - a.level);
        this.levels = levels;
        return levels;
    }

    parseEmailContext(text) {
        if (!text.trim()) return;

        // Convert email content to lowercase for case-insensitive matching
        const emailContent = text.toLowerCase();
        
        // Update context only for major levels
        this.levels.forEach(levelObj => {
            if (!levelObj.major) {
                levelObj.context = ''; // Clear context for non-major levels
                return;
            }

            const level = levelObj.level.toString();
            
            // Find mentions of this level in the email
            const levelIndex = emailContent.indexOf(level);
            if (levelIndex !== -1) {
                // Find all sentences containing this level
                let bestContext = '';
                let currentIndex = levelIndex;
                
                while (currentIndex !== -1) {
                    const sentenceStart = emailContent.lastIndexOf('.', currentIndex) + 1;
                    const sentenceEnd = emailContent.indexOf('.', currentIndex);
                    
                    if (sentenceEnd === -1) break;
                    
                    let context = emailContent
                        .slice(sentenceStart, sentenceEnd)
                        .trim();
                    
                    // Skip sentences that only mention the level is major
                    const isMeaningless = /\b(major|support|resistance)\b/i.test(context) && 
                        context.length < 30; // Short sentences with just "major" are likely not meaningful
                    
                    if (!isMeaningless) {
                        // If we find a meaningful context, use it
                        bestContext = context;
                        break;
                    }
                    
                    // Look for next mention of this level
                    currentIndex = emailContent.indexOf(level, currentIndex + 1);
                }
                
                if (bestContext) {
                    // If the context is too long, extract the relevant part
                    if (bestContext.length > 100) {
                        const words = bestContext.split(' ');
                        const levelWordIndex = words.findIndex(word => word.includes(level));
                        
                        // Take 7 words before and after the level mention for more context
                        const start = Math.max(0, levelWordIndex - 7);
                        const end = Math.min(words.length, levelWordIndex + 8);
                        bestContext = words.slice(start, end).join(' ');
                        
                        if (start > 0) bestContext = '...' + bestContext;
                        if (end < words.length) bestContext += '...';
                    }
                    
                    levelObj.context = bestContext;
                }
            }
        });

        return this.levels;
    }

    generateCsv() {
        const header = 'Level,Major,Context\n';
        const rows = this.levels.map(row => {
            // Properly escape context field for CSV
            const escapedContext = row.context ? `"${row.context.replace(/"/g, '""')}"` : '';
            const majorText = row.major ? 'major' : '';
            return `${row.level},${majorText},${escapedContext}`;
        }).join('\n');
        return header + rows;
    }
}
