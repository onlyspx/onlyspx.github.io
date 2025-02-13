document.addEventListener('DOMContentLoaded', () => {
    const pdfDropZone = document.getElementById('pdfDropZone');
    const txtDropZone = document.getElementById('txtDropZone');
    const pdfInput = document.getElementById('pdfInput');
    const txtInput = document.getElementById('txtInput');
    const resultSection = document.querySelector('.result-section');
    const csvPreview = document.getElementById('csvPreview');
    const copyButton = document.getElementById('copyButton');
    const downloadButton = document.getElementById('downloadButton');
    const pdfStatus = document.getElementById('pdfStatus').querySelector('.status-value');
    const txtStatus = document.getElementById('txtStatus').querySelector('.status-value');
    const errorDisplay = document.createElement('div');
    errorDisplay.className = 'error-message';
    document.querySelector('.upload-section').appendChild(errorDisplay);

    let pdfFile = null;
    let txtFile = null;

    // Handle drag and drop events for both drop zones
    [pdfDropZone, txtDropZone].forEach(dropZone => {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('drag-over');
            });
        });
    });

    // Handle file drop
    pdfDropZone.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') {
            handlePdfFile(file);
        } else {
            showError('Please upload a PDF file.');
        }
    });

    txtDropZone.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.txt')) {
            handleTxtFile(file);
        } else {
            showError('Please upload a TXT file.');
        }
    });

    // Handle file selection via button
    pdfDropZone.addEventListener('click', () => pdfInput.click());
    txtDropZone.addEventListener('click', () => txtInput.click());

    pdfInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            handlePdfFile(file);
        } else {
            showError('Please upload a PDF file.');
        }
    });

    txtInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.name.endsWith('.txt')) {
            handleTxtFile(file);
        } else {
            showError('Please upload a TXT file.');
        }
    });

    // Handle PDF file
    async function handlePdfFile(file) {
        try {
            pdfFile = file;
            updateFileStatus(pdfStatus, file.name);
            pdfDropZone.classList.add('has-file');
            clearError();
            await processFiles();
        } catch (error) {
            console.error('Error handling PDF file:', error);
            showError('Error processing PDF file. Please try again.');
            resetPdfInput();
        }
    }

    // Handle TXT file
    async function handleTxtFile(file) {
        try {
            txtFile = file;
            updateFileStatus(txtStatus, file.name);
            txtDropZone.classList.add('has-file');
            clearError();
            await processFiles();
        } catch (error) {
            console.error('Error handling TXT file:', error);
            showError('Error processing TXT file. Please try again.');
            resetTxtInput();
        }
    }

    // Process both files when available
    async function processFiles() {
        if (!pdfFile || !txtFile) return;

        try {
            showLoading();
            
            // Parse PDF file
            const pdfData = await parsePDF(pdfFile);
            console.log('PDF Data:', pdfData); // Debug log
            
            // Read TXT file
            const txtContent = await txtFile.text();
            const txtLines = txtContent.trim().split('\n');
            
            // Process each line from TXT file
            const updatedLines = txtLines.map(line => {
                const [low, high, type, _] = line.split(',');
                if (!low || !high || !type) return line; // Keep header or invalid lines as is
                
                // Find matching price range in PDF data
                const lowPrice = parseFloat(low);
                const highPrice = parseFloat(high);
                
                let zoneType = 'Normal'; // Default zone type
                let matchFound = false;
                
                // Search in both resistance and support sections
                for (const section of ['resistance', 'support']) {
                    if (!pdfData[section]) continue;
                    
                    for (const entry of pdfData[section]) {
                        for (const range of entry.ranges) {
                            // Match price ranges with some tolerance
                            if (Math.abs(range.low - lowPrice) <= 0.5 && 
                                Math.abs(range.high - highPrice) <= 0.5) {
                                console.log('Match found for prices:', lowPrice, highPrice); // Debug log
                                console.log('Entry notes:', entry.notes); // Debug log
                                console.log('Determined type:', entry.type); // Debug log
                                zoneType = entry.type;
                                matchFound = true;
                                break;
                            }
                        }
                        if (matchFound) break;
                    }
                    if (matchFound) break;
                }
                
                // Return updated line with new zone type
                return `${low},${high},${type},${zoneType}`;
            });
            
            // Display results
            displayResults(updatedLines.join('\n'));
            clearError();
        } catch (error) {
            console.error('Error processing files:', error);
            showError(error.message || 'Error processing files. Please try again.');
            hideResults();
        } finally {
            hideLoading();
        }
    }

    // Display the results
    function displayResults(content) {
        csvPreview.textContent = content;
        resultSection.style.display = 'block';
    }

    // Hide results
    function hideResults() {
        resultSection.style.display = 'none';
        csvPreview.textContent = '';
    }

    // Update file status display
    function updateFileStatus(statusElement, fileName) {
        statusElement.textContent = fileName;
        statusElement.classList.add('success');
    }

    // Reset input states
    function resetPdfInput() {
        pdfFile = null;
        pdfInput.value = '';
        pdfStatus.textContent = 'Not selected';
        pdfStatus.classList.remove('success');
        pdfDropZone.classList.remove('has-file');
    }

    function resetTxtInput() {
        txtFile = null;
        txtInput.value = '';
        txtStatus.textContent = 'Not selected';
        txtStatus.classList.remove('success');
        txtDropZone.classList.remove('has-file');
    }

    // Show error message
    function showError(message) {
        errorDisplay.textContent = message;
        errorDisplay.style.display = 'block';
    }

    // Clear error message
    function clearError() {
        errorDisplay.textContent = '';
        errorDisplay.style.display = 'none';
    }

    // Show loading state
    function showLoading() {
        pdfDropZone.classList.add('loading');
        txtDropZone.classList.add('loading');
    }

    // Hide loading state
    function hideLoading() {
        pdfDropZone.classList.remove('loading');
        txtDropZone.classList.remove('loading');
    }

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Copy to clipboard functionality
    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(csvPreview.textContent)
            .then(() => {
                const originalText = copyButton.textContent;
                copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyButton.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text:', err);
                showError('Failed to copy to clipboard');
            });
    });

    // Download TXT functionality
    downloadButton.addEventListener('click', () => {
        if (csvPreview.textContent) {
            const blob = new Blob([csvPreview.textContent], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            a.href = url;
            a.download = `updated-levels-${timestamp}.txt`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
    });
});
