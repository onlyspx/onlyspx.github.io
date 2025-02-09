class DataLoader {
    constructor() {
        this.data = [];
        this.processedData = [];
    }

    async loadData() {
        try {
            // Use relative path from current location
            const response = await fetch('../data/spx-data.csv');
            const csvText = await response.text();
            this.data = this.parseCSV(csvText);
            this.processedData = this.addDayOfWeek(this.data);
            return this.processedData;
        } catch (error) {
            console.error('Error loading data:', error);
            const tableBody = document.getElementById('tableBody');
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Error loading data. Please check the console for details.</td></tr>';
            return [];
        }
    }

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');
        
        return lines.slice(1).map(line => {
            const values = line.split(',');
            const row = {};
            headers.forEach((header, index) => {
                row[header.trim()] = values[index]?.trim() || '';
            });
            return row;
        });
    }

    addDayOfWeek(data) {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        return data.map(row => {
            const [month, day, year] = row.Date.split('/');
            const date = new Date(year, month - 1, day);
            return {
                ...row,
                Day: daysOfWeek[date.getDay()]
            };
        });
    }

    filterByDay(day) {
        if (!day) return this.processedData;
        return this.processedData.filter(row => row.Day === day);
    }
}

// Create global instance
const dataLoader = new DataLoader();
