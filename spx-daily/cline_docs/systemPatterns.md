# System Patterns

## Architecture
- Browser-based web application
- Static HTML/CSS/JavaScript implementation
- No backend server required - runs entirely in browser
- CSV data loaded and processed client-side

## Key Components
1. DataLoader (js/dataLoader.js)
   - Handles CSV data loading and parsing
   - Processes dates to add day-of-week information
   - Maintains data state and filtering capabilities

2. FilterManager (js/filters.js)
   - Manages UI filter controls
   - Handles filter state and updates
   - Updates table display with filtered data

3. Main Application (js/main.js)
   - Initializes application components
   - Handles error states and loading states
   - Coordinates between DataLoader and FilterManager

## Data Flow
1. CSV data loaded from local file
2. Data parsed and processed by DataLoader
3. FilterManager listens for filter changes
4. Table updates based on applied filters

## Technical Decisions
- Uses vanilla JavaScript for simplicity and performance
- Class-based architecture for better organization
- CSV data format for easy data updates
- Client-side processing for instant filtering
