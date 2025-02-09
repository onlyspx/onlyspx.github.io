# Product Context

## Purpose
This project consists of three tools that help traders process, analyze, and format their trading data:
1. Trading Levels to CSV Converter - Converts trading level data into a structured CSV format
2. Peter Alert TOS Formatter - Formats trading alerts for ThinkOrSwim platform compatibility
3. SPX Daily Analysis - Provides historical S&P 500 data analysis with day-of-week filtering

## Problems Solved
1. SPX Daily Analysis:
   - Provides easy access to historical S&P 500 data
   - Enables analysis of market patterns by day of the week
   - Presents data in a clear, sortable table format
   - Allows filtering to identify specific day patterns
   - Helps traders understand market behavior on different days

2. Trading Levels Converter:
   - Converts unstructured trading level data into a standardized CSV format
   - Automatically categorizes trading levels into different zones (RZ2, RZ1, Pivot, SZ1, SZ2)
   - Handles special cases like two-digit high values by intelligently adjusting them
   - Provides an easy-to-use interface for data input and CSV download

2. Peter Alert TOS Formatter:
   - Standardizes trading alert format for ThinkOrSwim compatibility
   - Removes unnecessary exchange codes (CBOE, PHLX, etc.)
   - Converts trading action terms (BOT → BUY, SOLD → SELL)
   - Ensures proper LMT suffix for orders
   - Provides copy to clipboard functionality with visual feedback

## Expected Behavior
1. SPX Daily Analysis:
   - Loads historical S&P 500 data automatically
   - Allows filtering by specific days of the week
   - Displays data in a responsive, easy-to-read table
   - Shows key metrics: Date, Open, High, Low, Close
   - Updates data periodically to maintain accuracy

2. Trading Levels Converter:
   - User pastes raw trading level data into the textarea
   - Data should be in a format containing zone headers and symbol-range pairs
   - Application parses the input and identifies:
     * Trading zones (RZ2, RZ1, Pivot, SZ1, SZ2)
     * Symbol names
     * Low and high values for each range
   - Generates a downloadable CSV file with columns: Name, Symbol, Low, High
   - Provides immediate feedback for invalid input or empty data

2. Peter Alert TOS Formatter:
   - User enters trading alert text
   - System automatically:
     * Removes exchange codes
     * Standardizes trading actions
     * Adds LMT suffix if missing
   - Displays formatted result
   - Allows one-click copying with checkmark feedback
