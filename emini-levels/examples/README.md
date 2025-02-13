# Example Files

These files demonstrate how to use the E-mini Levels Converter:

## example.txt
Contains price levels in CSV format:
```
price_low,price_high,type,note
5400.00,5408.00,R,Normal
5382.50,5387.50,R,Normal
5368.25,5372.75,R,Normal
```

## example.pdf
Contains detailed notes for each price level, including:
- Zone types (Initial Resistance, Range Exhaustion, etc.)
- Trading directions (Bullish/Bearish)
- Actions (Break, Hold, Reversal)

## Output Format
The tool combines both files and produces output like:
```
5400.00,5408.00,R,Initial Resistance: Break Bullish
5382.50,5387.50,R,Range Exhaustion: Reversal Lower
5368.25,5372.75,R,Pre-market Support: Hold Bullish
```

The last column is updated with summarized notes from the PDF while preserving important zone types.
