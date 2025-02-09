# Product Context

## Purpose
This project consists of two tools that help traders process and format their trading data:
1. Trading Levels to CSV Converter - Converts trading level data into a structured CSV format
2. Peter Alert TOS Formatter - Formats trading alerts for ThinkOrSwim platform compatibility

## Problems Solved
1. Trading Levels Converter:
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
1. Trading Levels Converter:
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
