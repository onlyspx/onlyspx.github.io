# Trading Tools

Two web-based tools for trading workflow automation:

## 1. FPL Trading Levels Converter
- Converts formatted trading levels to CSV
- Output compatible with [FPL SR Levels TradingView Indicator](https://www.tradingview.com/script/jbJcHqAb-FPL-SR-Levels/)
- Supports RZ2, RZ1, Pivot, SZ1, SZ2 zones

## 2. TOS Alert Formatter
- Formats trading alerts for ThinkOrSwim platform
- Removes exchange codes
- Standardizes trading actions (BOT → BUY, SOLD → SELL)
- Adds LMT suffix

## Project Structure
```
/
├── index.html              # Landing page with links to both tools
├── trading-levels.html     # FPL Trading Levels Converter
├── peter-alert-tos.html   # TOS Alert Formatter
├── script.js              # Trading Levels converter logic
├── tos-formatter.js       # TOS Alert formatter logic
├── styles.css            # Shared styles
└── cline_docs/           # Project documentation
    ├── productContext.md
    ├── systemPatterns.md
    ├── techContext.md
    ├── progress.md
    └── activeContext.md
```

## Usage
Simple web interface, no installation required. Open index.html to access both tools.

## Support
Contact: chintanontrading@outlook.com
