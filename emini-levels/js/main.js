document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const resultSection = document.querySelector('.result-section');
    const csvPreview = document.getElementById('csvPreview');
    const copyButton = document.getElementById('copyButton');
    const downloadButton = document.getElementById('downloadButton');
    const errorDisplay = document.createElement('div');
    errorDisplay.className = 'error-message';
    dropZone.parentNode.insertBefore(errorDisplay, dropZone.nextSibling);

    // Handle drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

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

    // Handle file drop
    dropZone.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files[0];
        if (file) {
            if (file.type === 'application/pdf') {
                clearError();
                handleFile(file);
            } else {
                showError('Please upload a PDF file.');
            }
        }
    });

    // Handle file selection via button
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type === 'application/pdf') {
                clearError();
                handleFile(file);
            } else {
                showError('Please upload a PDF file.');
            }
        }
    });

    // Process the PDF file
    async function handleFile(file) {
        try {
            showLoading();
            const parsedData = await parsePDF(file);
            
            // Validate parsed data
            if (!parsedData || (!parsedData.resistance && !parsedData.support)) {
                throw new Error('No valid price levels found in the PDF. Please check the file format.');
            }

            const csvData = generateCSV(parsedData);
            if (!csvData || csvData.split('\n').length <= 1) {
                throw new Error('Failed to generate CSV data. No valid levels were extracted.');
            }

            displayResults(csvData);
            clearError();
        } catch (error) {
            console.error('Error processing file:', error);
            showError(error.message || 'Error processing the PDF file. Please try again.');
            hideResults();
        } finally {
            hideLoading();
        }
    }

    // Display the results
    function displayResults(csvData) {
        csvPreview.textContent = csvData;
        resultSection.style.display = 'block';
    }

    // Hide results
    function hideResults() {
        resultSection.style.display = 'none';
        csvPreview.textContent = '';
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
        dropZone.classList.add('loading');
        dropZone.textContent = 'Processing...';
    }

    // Hide loading state
    function hideLoading() {
        dropZone.classList.remove('loading');
        dropZone.textContent = 'Drop PDF file here or click to upload';
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

    // Download CSV functionality
    downloadButton.addEventListener('click', () => {
        if (csvPreview.textContent) {
            downloadCSV(csvPreview.textContent);
        }
    });
});
