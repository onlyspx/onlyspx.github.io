document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const outputPreview = document.getElementById('outputPreview');
    const copyButton = document.getElementById('copyButton');
    const copyConfirmation = document.getElementById('copyConfirmation');
    
    const parser = new LevelParser();

    // Process input text and update output
    function processInput() {
        const text = inputText.value.trim();
        if (!text) {
            outputPreview.textContent = '';
            copyButton.disabled = true;
            return;
        }

        try {
            const levels = parser.parse(text);
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
        const exampleText = document.querySelector('.example-input .example-text');
        if (exampleText) {
            inputText.value = exampleText.textContent;
            processInput();
        }
    }
});
