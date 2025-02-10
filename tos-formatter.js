function processInput() {
    const input = document.getElementById("userInput").value;
    let processed = input;
    
    // Remove exchange codes
    const exchanges = ['CBOE', 'PHLX', 'AMEX', 'ISE', 'BOX', 'NYSE', 'NASDAQ', 'BATS', 'MEMX', 'C2'];
    exchanges.forEach(exchange => {
        processed = processed.replace(new RegExp(exchange, 'g'), '');
    });

    // Remove other codes
    processed = processed.replace(/cr/g, '');
    processed = processed.replace(/db/g, '');

    // Standardize trading actions
    processed = processed.replace(/BOT/g, 'BUY');
    processed = processed.replace(/SOLD/g, 'SELL');

    // Extract from BUY/SELL onwards
    const buyIndex = processed.indexOf('BUY');
    const sellIndex = processed.indexOf('SELL');
    const index = (buyIndex > -1 ? buyIndex : sellIndex);
    if (index > -1) {
        processed = processed.substring(index);
    }

    // Remove + from quantity
    const words = processed.split(' ');
    if (words.length > 1) {
        words[1] = words[1].replace(/\+/g, '');
        processed = words.join(' ');
    }

    // Add LMT suffix if missing
    processed = processed.replace(/\s+/g, ' ').trim(); // Replace all whitespace sequences with single space
    if (!processed.endsWith('LMT')) {
        processed = processed + ' LMT';
    }

    // Update output and hide checkmark
    document.getElementById("output").textContent = processed.trim();
    document.getElementById("copyButton").innerText = "📋 Copy to Clipboard";
    document.getElementById("copyButton").classList.remove("success");
}

async function copyToClipboard() {
    const text = document.getElementById("output").textContent;
    const copyButton = document.getElementById("copyButton");
    
    try {
        await navigator.clipboard.writeText(text);
        copyButton.innerText = "✓ Copied!";
        copyButton.classList.add("success");
        
        // Reset button after 2 seconds
        setTimeout(() => {
            copyButton.innerText = "📋 Copy to Clipboard";
            copyButton.classList.remove("success");
        }, 2000);
    } catch (err) {
        alert("Failed to copy to clipboard. Please try again.");
    }
}
