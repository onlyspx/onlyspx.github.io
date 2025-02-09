class FilterManager {
    constructor() {
        this.dayFilter = document.getElementById('dayFilter');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.dayFilter.addEventListener('change', () => {
            this.applyFilters();
        });
    }

    applyFilters() {
        const selectedDay = this.dayFilter.value;
        const filteredData = dataLoader.filterByDay(selectedDay);
        this.updateTable(filteredData);
    }

    updateTable(data) {
        const tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = '';

        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.Date}</td>
                <td>${row.Day}</td>
                <td>${row['Close/Last']}</td>
                <td>${row.Open}</td>
                <td>${row.High}</td>
                <td>${row.Low}</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    reset() {
        this.dayFilter.value = '';
        this.applyFilters();
    }
}

// Create global instance
const filterManager = new FilterManager();
