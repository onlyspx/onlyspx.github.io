class ShadowParser {
    constructor() {
        this.keyLevels = [];
        this.marketProfile = [];
    }

    parseKeyLevels(text) {
        const lines = text.split('\n');
        const keyLevels = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            if (line === 'Key Levels for Today') continue;
            if (line === 'Virgin Point of Control (VPOC)') {
                // Handle VPOC entries
                while (i + 1 < lines.length) {
                    i++;
                    const vpocLine = lines[i].trim();
                    if (!vpocLine) break;
                    
                    const [level, date] = vpocLine.split('\t');
                    if (level && date) {
                        keyLevels.push({
                            level: level.trim(),
                            description: `VPOC ${date.trim()}`
                        });
                    }
                }
            } else {
                // Handle regular key levels
                const parts = line.split('\t');
                if (parts.length === 2) {
                    const [level, description] = parts;
                    keyLevels.push({
                        level: level.trim(),
                        description: description.trim()
                    });
                }
            }
        }

        // Sort key levels by price in descending order
        keyLevels.sort((a, b) => parseFloat(b.level) - parseFloat(a.level));
        this.keyLevels = keyLevels;
        return keyLevels;
    }

    parseMarketProfile(text) {
        const lines = text.split('\n');
        const marketProfile = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Skip the header if present
            if (line.includes('Market Profile')) continue;

            const parts = line.split('\t');
            if (parts.length === 3) {
                const [description, esLevel, nqLevel] = parts;
                if (esLevel && nqLevel) {
                    marketProfile.push({
                        description: description.trim(),
                        esLevel: esLevel.trim(),
                        nqLevel: nqLevel.trim()
                    });
                }
            }
        }

        this.marketProfile = marketProfile;
        return marketProfile;
    }

    generateKeyLevelsCsv() {
        const header = 'ES Level,Description\n';
        const rows = this.keyLevels.map(row => 
            `${row.level},${row.description}`
        ).join('\n');
        return header + rows;
    }

    generateMarketProfileCsv() {
        const header = 'Description,ES Level,NQ Level\n';
        const rows = this.marketProfile.map(row =>
            `${row.description},${row.esLevel},${row.nqLevel}`
        ).join('\n');
        return header + rows;
    }
}
