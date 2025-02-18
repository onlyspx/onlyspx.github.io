// Hide loading indicator function
function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

// Initialize app immediately without waiting for DOMContentLoaded
function initializeApp() {
    console.log('Initializing application...');

    // Get DOM elements
    const inputText = document.getElementById('inputText');
    const outputPreview = document.getElementById('outputPreview');
    const copyButton = document.getElementById('copyButton');
    const copyConfirmation = document.getElementById('copyConfirmation');
    
    // Verify elements were found
    if (!inputText || !outputPreview || !copyButton || !copyConfirmation) {
        console.error('Failed to find required DOM elements:', {
            inputText: !!inputText,
            outputPreview: !!outputPreview,
            copyButton: !!copyButton,
            copyConfirmation: !!copyConfirmation
        });
        return;
    }

    // Initialize parser
    let parser;
    try {
        parser = new LevelParser();
        console.log('Parser initialized successfully');
    } catch (error) {
        console.error('Failed to initialize parser:', error);
        return;
    }

    // Ensure textarea is enabled and visible
    inputText.disabled = false;
    inputText.style.display = 'block';

    // Process input text and update output
    function processInput() {
        console.log('Processing input...');
        const text = inputText.value.trim();
        if (!text) {
            outputPreview.textContent = '';
            copyButton.disabled = true;
            return;
        }

        try {
            const levels = parser.parse(text);
            console.log('Successfully parsed levels:', levels);
            outputPreview.textContent = levels.join('\n');
            copyButton.disabled = false;
        } catch (error) {
            console.error('Error parsing text:', error);
            outputPreview.textContent = 'Error processing text. Please check your input.';
            copyButton.disabled = true;
        }
    }

    // Handle input changes
    inputText.addEventListener('input', processInput);

    // Copy to clipboard functionality
    copyButton.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(outputPreview.textContent);
            
            // Show confirmation
            copyConfirmation.classList.add('show');
            setTimeout(() => {
                copyConfirmation.classList.remove('show');
            }, 2000);
        } catch (error) {
            console.error('Failed to copy text:', error);
            copyConfirmation.textContent = 'Failed to copy!';
            copyConfirmation.style.backgroundColor = 'var(--error-color)';
            copyConfirmation.classList.add('show');
            setTimeout(() => {
                copyConfirmation.classList.remove('show');
                copyConfirmation.textContent = 'Copied to clipboard!';
                copyConfirmation.style.backgroundColor = 'var(--success-color)';
            }, 2000);
        }
    });

    // Initialize with example text if input is empty
    if (!inputText.value) {
        console.log('Initializing with example text...');
        const exampleText = document.querySelector('.example-input .example-text');
        if (exampleText) {
            inputText.value = exampleText.textContent.trim();
            processInput();
        } else {
            console.warn('Example text element not found');
        }
    }

    console.log('Application initialization complete');
    hideLoadingIndicator();
}

// Run initialization
try {
    initializeApp();
} catch (error) {
    console.error('Failed to initialize application:', error);
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'Failed to initialize application: ' + error.message;
    }
    hideLoadingIndicator();
}
