# Technical Context

## Technologies Used
1. Frontend (All Tools)
   - HTML5
   - CSS3
   - Vanilla JavaScript (ES6+)
   - Fetch API (SPX Daily)

2. Browser APIs
   a. SPX Daily:
      - Fetch API for data loading
      - Table manipulation APIs
      - DOM manipulation APIs
      - Date manipulation APIs

   b. Trading Levels Converter:
      - Blob API for file generation
      - URL.createObjectURL for file download
      - DOM manipulation APIs

   b. TOS Formatter:
      - Clipboard API for copy functionality
      - Form submission APIs
      - DOM manipulation APIs

## Development Setup
- No build tools required
- No package dependencies
- Can be served from any static file server
- Development can be done with any text editor/IDE
- CSV data updates for SPX Daily tool
- Support email configured: chintanontrading@outlook.com

## Technical Constraints

1. Browser Compatibility
   a. SPX Daily requires:
      - Fetch API
      - ES6+ Array methods
      - Modern Date object methods
      - CSS Grid/Flexbox
      - Dynamic table manipulation

   b. Trading Levels Converter requires:
      - Blob API
      - URL.createObjectURL
      - Template literals
      - Arrow functions
      - Modern CSS features

   b. TOS Formatter requires:
      - Modern Clipboard API
      - ES6+ String methods
      - Event handling
      - DOM manipulation

2. Input Format Requirements
   a. SPX Daily:
      - CSV data must follow specific format
      - Date format must be consistent
      - Numeric data must be valid
      - File must be properly encoded (UTF-8)

   b. Trading Levels Converter:
      - Text must follow specific zone header format
      - Trading pairs must be in "SYMBOL LOW-HIGH" format
      - Numbers must be integers
      - Two-digit high values are automatically adjusted

   b. TOS Formatter:
      - Input should be trading alerts
      - Supports various exchange codes (CBOE, PHLX, AMEX, etc.)
      - Handles BOT/SOLD action terms
      - Expects standard option contract format

3. Performance Considerations
   - All processing happens client-side
   - Memory usage scales with input size
   - Large datasets may impact performance
   - String operations are optimized for small to medium text inputs
   - Table rendering optimized for large datasets (SPX Daily)
   - Filter operations designed for quick response

4. Security
   - No data leaves the browser
   - No external dependencies
   - No data persistence
   - Clipboard operations require user permission
