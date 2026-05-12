# 🏢 Condo Financial Analyzer

An interactive, browser-based financial decision tool for analyzing condo purchases in the **Philippine real estate market**.

🔗 **[Live Demo → GitHub Pages](https://your-username.github.io/FINANCIAL-CHECKR/)**

---

## Features

- **Multi-Profile Management** — Compare multiple property units side by side
- **Real-Time Financial Calculations** — Monthly amortization, DTI ratio, upfront costs
- **Risk Score Engine** — 12-point composite score with Buy / Caution / Avoid verdict
- **Stress Testing** — Simulate Base / Shock / Severe interest rate scenarios
- **Buy vs. Rent Comparison** — 25-year lifetime cost projection with interactive chart
- **AI-Style Explanation** — Contextual narrative summary of your financial situation
- **Philippine-Specific Fees** — CGT, DST, Transfer Tax, Notarial, Bank Fees pre-loaded

## Tech Stack

- **HTML5 / CSS3 / Vanilla JS** — zero dependencies, no build step required
- **[Chart.js 4.4](https://www.chartjs.org/)** — via CDN for all charts and the risk gauge
- **Google Fonts** — Inter + Space Grotesk

## Usage

1. Open `index.html` in any modern browser — **no server required**
2. Enter your property details in the left panel
3. Click **🔍 Analyze Now** to generate results
4. Use the stress test presets to explore rate shock scenarios
5. Click **✨ Explain My Result** for an AI-style narrative summary

## Local Development

No build tools needed. Just open the file:

```bash
# Option 1: Direct open
start index.html

# Option 2: Simple HTTP server (Python)
python -m http.server 8080

# Option 3: VS Code Live Server extension
```

## Deployment (GitHub Pages)

This project is pre-configured for GitHub Pages:

1. Push to a GitHub repository
2. Go to **Settings → Pages**
3. Set source to **Deploy from a branch → `main` → `/ (root)`**
4. Your site will be live at `https://your-username.github.io/repo-name/`

## License

MIT — free to use and modify.
