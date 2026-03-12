# SPX Tools

Static site with the actively used trading tools hosted on `onlyspx.github.io`.

## Current Tools

### 1. Peter Alert
- Formats trading alerts for ThinkOrSwim
- Removes exchange codes
- Standardizes trading action text

### 2. E-mini Levels
- Merges zone TXT files with notes from the current EminiPlayer worksheet PDF
- Preserves original TXT notes when a level is not present in the PDF

### 3. Smash Level Extractor
- Converts level-analysis text into CSV output

## Project Structure

```
/
├── index.html                    # Landing page
├── landing.css                   # Landing page styles
├── peter-alert-tos.html          # Peter Alert page
├── tos-formatter.js              # Peter Alert logic
├── styles.css                    # Shared styles for root pages
├── emini-levels/                 # E-mini Levels tool
└── smash-level-extractor/        # Smash Level Extractor tool
```

## Usage

Serve the repo as a static site or open the pages in a browser.
