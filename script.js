function convertToCSV() {
    let input = document.getElementById("inputData").value;
    
    if (!input.trim()) {
        alert("Please enter valid trading levels data.");
        return;
    }

    let rows = [];
    let lines = input.split("\n");
    let currentZone = "";

    for (let line of lines) {
        line = line.trim();
        
        if (!line) continue;

        // Detect zone name
        if (line.includes("Resistance Zone 1")) currentZone = "RZ1";
        else if (line.includes("Pivot Zone")) currentZone = "Pivot";
        else if (line.includes("Support Zone 1")) currentZone = "SZ1";
        else if (line.includes("SUPPORT ZONE 2")) currentZone = "SZ2";
        else if (line.includes("RESISTANCE ZONE 2")) currentZone = "RZ2";
        else {
            // Extract Symbol, Low, and High
            let parts = line.split(/\s+/);
            if (parts.length === 2) {
                let symbol = parts[0];
                let range = parts[1].split("-");
                if (range.length === 2) {
                    let low = parseInt(range[0], 10);
                    let high = parseInt(range[1], 10);

                    // Adjust high if it's a two-digit number
                    if (high < 100) {
                        high = Math.floor(low / 100) * 100 + high;
                    }

                    rows.push([currentZone, symbol, low, high]);
                }
            }
        }
    }

    if (rows.length === 0) {
        alert("No valid data found.");
        return;
    }

    // Generate CSV content
    let csvContent = "Name,Symbol,Low,High\n";
    rows.forEach(row => {
        csvContent += row.join(",") + "\n";
    });

    // Update preview
    document.getElementById("csvContent").textContent = csvContent;
    document.getElementById("csvPreview").style.display = "block";
    
    // Show copy button
    document.getElementById("copyButton").style.display = "inline-block";

    // Create downloadable CSV file
    let blob = new Blob([csvContent], { type: "text/csv" });
    let url = URL.createObjectURL(blob);
    let downloadLink = document.getElementById("downloadLink");

    downloadLink.href = url;
    downloadLink.download = "trading_levels.csv";
    downloadLink.style.display = "inline-block";
    downloadLink.innerText = "Download CSV";
}

async function copyToClipboard() {
    const csvContent = document.getElementById("csvContent").textContent;
    const copyButton = document.getElementById("copyButton");
    
    try {
        await navigator.clipboard.writeText(csvContent);
        
        // Visual feedback
        const originalText = copyButton.innerText;
        copyButton.innerText = "✓ Copied!";
        copyButton.classList.add("success");
        
        // Reset button after 2 seconds
        setTimeout(() => {
            copyButton.innerText = originalText;
            copyButton.classList.remove("success");
        }, 2000);
    } catch (err) {
        alert("Failed to copy to clipboard. Please try again.");
    }
}

function fillExample() {
    const exampleText = document.querySelector('.example-content').textContent;
    const textarea = document.getElementById('inputData');
    textarea.value = exampleText;
    textarea.scrollIntoView({ behavior: 'smooth' });
    textarea.focus();
}
