# S&P 500 Historical Data Viewer

A simple web application to view and analyze S&P 500 historical data with day-of-week filtering capabilities.

## Features

- Display S&P 500 historical data in a clean, organized table
- Filter data by day of the week
- Responsive design for mobile and desktop viewing
- Simple and intuitive user interface

## Project Structure

```
/
├── index.html          # Main page
├── css/               
│   └── styles.css     # Styling
├── js/                
│   ├── main.js       # Main application logic
│   ├── dataLoader.js # CSV data handling
│   └── filters.js    # Filtering functionality
└── data/              
    └── spx-data.csv  # S&P 500 historical data
```

## Setup

1. Clone the repository
2. Place your S&P 500 data CSV file in the `data` directory as `spx-data.csv`
3. Open `index.html` in a web browser

## Data Format

The application expects a CSV file with the following columns:
- Date
- Close/Last
- Open
- High
- Low

The application will automatically add a "Day" column showing the day of the week for each date.

## Updating Data

To update the data:
1. Replace the contents of `data/spx-data.csv` with new data
2. Ensure the CSV format matches the expected structure
3. Refresh the page to load new data

## Browser Compatibility

Tested and working in:
- Chrome
- Firefox
- Safari
- Edge
