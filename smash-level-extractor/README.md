# Smash Level Extractor

A tool to extract price levels and notes from analysis text and convert them to CSV format.

## Features

- Extracts price levels and their context
- Automatically identifies different types of levels:
  - Smash levels
  - Target levels (first, final, potential)
  - Directional targets (upside/downside)
- Outputs in CSV format: `level,note`
- One-click copy to clipboard
- Real-time processing

## Example

Input text:
```
In terms of levels, the Smashlevel is at 6066. Holding above this level would target 6093, with a final target at 6107 (and potentially 6121) under sustained buying pressure. Conversely, failure to hold above 6066 would target 6045, with a final target at 6025 under sustained selling pressure.
```

Output CSV:
```
6066,smashlevel
6093,first target
6107,final target
6121,potential target
6045,downside target
6025,final downside target
```

## Usage

1. Paste your analysis text into the input box
2. The tool automatically extracts levels and notes
3. Click "Copy CSV" to copy the formatted output

## Level Types

The tool recognizes several types of levels:
- Smash levels (e.g., "Smashlevel at 6066")
- Target levels (e.g., "target 6093")
- Final targets (e.g., "final target at 6107")
- Potential targets (e.g., "potentially 6121")
- Directional targets (e.g., "downside target 6045")
