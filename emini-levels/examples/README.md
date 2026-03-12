# Example Files

These files demonstrate how to use the E-mini Levels Converter:

## example.txt
Contains the March 12, 2026 zone file in CSV format:
``` 
6960.75,6970.75,R,Normal
6941.00,6949.00,R,Normal
6924.00,6934.00,R,Normal
```

## example.pdf
Contains the matching March 12, 2026 EminiPlayer worksheet using the current table layout:
- Zone range
- Effect on Intraday Bias
- Notes

## Output Format
The tool combines both files and produces output like:
```
6960.75,6970.75,R,Normal
6941.00,6949.00,R,Break-out Signals Strength 6944.75 HVN, Range Extreme
6722.25,6732.50,S,Break-down Signals Weakness Pre-Market Support
```

If a zone is not present in the PDF, the original TXT note is preserved.
