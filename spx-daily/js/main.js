document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Show loading state
        const tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;"><i>Loading SPX data...</i></td></tr>';

        // Load and process the data
        const data = await dataLoader.loadData();
        
        // Initialize the table with all data
        filterManager.updateTable(data);

    } catch (error) {
        console.error('Error initializing application:', error);
        const tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Error loading data. Please check your connection and try again. If the problem persists, the data file may be temporarily unavailable.</td></tr>';
    }
});

// Add error handling for fetch failures
window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled promise rejection:', event.reason);
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Error loading data. Please check your connection and try again.</td></tr>';
});
