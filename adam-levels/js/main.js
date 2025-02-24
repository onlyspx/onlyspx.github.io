document.addEventListener('DOMContentLoaded', () => {
    const parser = new AdamLevelsParser();
    const levelsInput = document.getElementById('levelsInput');
    const emailInput = document.getElementById('emailInput');
    const emailFile = document.getElementById('emailFile');
    const parseButton = document.getElementById('parseButton');
    const downloadLevelsButton = document.getElementById('downloadLevels');
    const copyLevelsButton = document.getElementById('copyLevels');
    const levelsTable = document.getElementById('levelsTable').getElementsByTagName('tbody')[0];

    // Handle email file upload
    emailFile.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            emailInput.value = content;
        };
        reader.readAsText(file);
    });

    function updateTable() {
        // Clear existing table data
        levelsTable.innerHTML = '';

        // Update levels table
        parser.levels.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.level}</td>
                <td>${row.major ? 'major' : ''}</td>
                <td>${row.context || ''}</td>
            `;
            levelsTable.appendChild(tr);
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
        const levelsText = levelsInput.value;
        const emailText = emailInput.value;

        if (!levelsText) {
            alert('Please paste levels content in the input area.');
            return;
        }

        // Parse levels first
        parser.parseLevels(levelsText);

        // Then parse email context if provided
        if (emailText) {
            parser.parseEmailContext(emailText);
        }

        updateTable();
    });

    downloadLevelsButton.addEventListener('click', () => {
        if (parser.levels.length === 0) {
            alert('Please parse the levels data first.');
            return;
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        downloadCsv(parser.generateCsv(), `es-levels-${timestamp}.csv`);
    });

    copyLevelsButton.addEventListener('click', () => {
        if (parser.levels.length === 0) {
            alert('Please parse the levels data first.');
            return;
        }
        navigator.clipboard.writeText(parser.generateCsv())
            .then(() => {
                const originalText = copyLevelsButton.textContent;
                copyLevelsButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyLevelsButton.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text:', err);
                alert('Failed to copy to clipboard');
            });
    });
});
