# System Patterns

## Architecture
Both tools follow similar patterns:
- Single-page web applications
- Client-side processing with vanilla JavaScript
- No backend required - all processing happens in the browser

## Key Technical Decisions

1. Trading Levels Converter Patterns:
   a. Data Processing Pattern
      - Input parsing using string manipulation and regex
      - Zone-based state tracking during parsing
      - Array-based data structure for storing parsed entries

   b. File Generation Pattern
      - In-memory CSV generation
      - Blob API for file creation
      - URL.createObjectURL for file download

   c. Error Handling Pattern
      - Input validation before processing
      - User feedback through browser alerts
      - Empty input and no-data-found checks

2. TOS Formatter Patterns:
   a. Text Processing Pattern
      - Chain of replacements for exchange codes
      - Action word standardization
      - Position-based text extraction
      - Suffix validation and addition

   b. Clipboard Integration Pattern
      - Modern Clipboard API usage
      - Visual feedback with checkmark
      - Error handling for clipboard operations

   c. Form Handling Pattern
      - Event prevention for form submission
      - Real-time processing on submit
      - Input clearing and reset capability

## Code Organization

1. Trading Levels Converter:
   a. HTML (index.html)
      - Basic structure with minimal elements
      - Inline event handler for simplicity
      - Semantic markup for accessibility

   b. JavaScript (script.js)
      - Single responsibility function (convertToCSV)
      - Sequential processing flow:
        * Input validation
        * Data parsing
        * CSV generation
        * Download link creation

   c. CSS (styles.css)
      - Minimal styling for usability
      - Mobile-responsive design
      - Clear visual hierarchy

2. TOS Formatter:
   a. HTML (peter-alert-tos.html)
      - Form-based input structure
      - Example section for user reference
      - Inline styles for simplicity

   b. JavaScript (embedded)
      - Two main functions:
        * processInput(): Text transformation
        * copyToClipboard(): Clipboard handling
      - Console logging for debugging

   c. CSS (embedded)
      - Minimal inline styles
      - Visual feedback elements
      - Simple layout structure
