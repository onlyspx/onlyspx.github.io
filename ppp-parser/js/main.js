document.addEventListener('DOMContentLoaded', () => {
    const parser = new ShadowParser();
    const keyLevelsInput = document.getElementById('keyLevelsInput');
    const marketProfileInput = document.getElementById('marketProfileInput');
    const parseButton = document.getElementById('parseButton');
    const downloadKeyLevelsButton = document.getElementById('downloadKeyLevels');
    const downloadMarketProfileButton = document.getElementById('downloadMarketProfile');
    const copyKeyLevelsButton = document.getElementById('copyKeyLevels');
    const copyMarketProfileButton = document.getElementById('copyMarketProfile');
    const keyLevelsTable = document.getElementById('keyLevelsTable').getElementsByTagName('tbody')[0];
    const marketProfileTable = document.getElementById('marketProfileTable').getElementsByTagName('tbody')[0];

    function updateTables() {
        // Clear existing table data
        keyLevelsTable.innerHTML = '';
        marketProfileTable.innerHTML = '';

        // Update Key Levels table
        parser.keyLevels.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.level}</td>
                <td>${row.description}</td>
            `;
            keyLevelsTable.appendChild(tr);
        });

        // Update Market Profile table
        parser.marketProfile.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.description}</td>
                <td>${row.esLevel}</td>
                <td>${row.nqLevel}</td>
            `;
            marketProfileTable.appendChild(tr);
        });
    }

    function downloadCsv(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, filename);
            return;
        }
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    parseButton.addEventListener('click', () => {
        const keyLevelsText = keyLevelsInput.value;
        const marketProfileText = marketProfileInput.value;

        if (!keyLevelsText && !marketProfileText) {
            alert('Please paste content in at least one of the input areas.');
            return;
        }

        if (keyLevelsText) {
            parser.parseKeyLevels(keyLevelsText);
        }

        if (marketProfileText) {
            parser.parseMarketProfile(marketProfileText);
        }

        updateTables();
    });

    downloadKeyLevelsButton.addEventListener('click', () => {
        if (parser.keyLevels.length === 0) {
            alert('Please parse the key levels data first.');
            return;
        }
        downloadCsv(parser.generateKeyLevelsCsv(), 'key_levels.csv');
    });

    downloadMarketProfileButton.addEventListener('click', () => {
        if (parser.marketProfile.length === 0) {
            alert('Please parse the market profile data first.');
            return;
        }
        downloadCsv(parser.generateMarketProfileCsv(), 'market_profile.csv');
    });

    // Copy to clipboard functionality
    copyKeyLevelsButton.addEventListener('click', () => {
        if (parser.keyLevels.length === 0) {
            alert('Please parse the key levels data first.');
            return;
        }
        navigator.clipboard.writeText(parser.generateKeyLevelsCsv())
            .then(() => {
                const originalText = copyKeyLevelsButton.textContent;
                copyKeyLevelsButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyKeyLevelsButton.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text:', err);
                alert('Failed to copy to clipboard');
            });
    });

    copyMarketProfileButton.addEventListener('click', () => {
        if (parser.marketProfile.length === 0) {
            alert('Please parse the market profile data first.');
            return;
        }
        navigator.clipboard.writeText(parser.generateMarketProfileCsv())
            .then(() => {
                const originalText = copyMarketProfileButton.textContent;
                copyMarketProfileButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyMarketProfileButton.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text:', err);
                alert('Failed to copy to clipboard');
            });
    });
});
