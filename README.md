# Vymetrix Brand Website

A high-performance, premium single-page landing website built for **Vymetrix** (an AI-native digital experience and visibility agency).

## Visual & Technical Highlights
- **Curated Dark Theme:** Rich space black surfaces (`#0a0a0f`) combined with glowing neon cyan, violet, and magenta accents.
- **Interactive Tech Canvas:** A live generative vector line grid in the hero section that reacts to mouse positions.
- **Pulse Analytics Dashboard:** An interactive simulation tool where users drag sliders (Latency, Semantic density, Interaction delays) to calculate Lighthouse score, traffic retention, and AI citation rates, redrawing SVG chart paths in real-time.
- **Blueprint Estimator:** A pricing customizer calculating Estimated Project value, bounce rate drops, and payback ROI.
- **Progressive Animation:** Native CSS scroll-driven animations (`animation-timeline: view()`) with a lightweight `IntersectionObserver` fallback for non-compatible browsers.
- **Accessible Design:** Proper semantic HTML outline, high-contrast text, clear focus states (`:focus-visible`), and ARIA controls.

## File Structure
- `index.html` - Core markup and semantic outline.
- `index.css` - Cascade layers styling architecture (`@layer`) and CSS custom properties design system.
- `index.js` - Dynamic dashboard simulations, canvas drawings, forms, and observers.

## How to Run the Website

### Option 1: Open the HTML Directly (Easiest)
Locate and double-click the `index.html` file in your file explorer. It will open natively in your default web browser.

### Option 2: Run a Python Server (Recommended)
To run a light development server, open your terminal, navigate to the folder, and run:
```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000` in your web browser.

### Option 3: Run via Node.js
If you have Node.js installed, run:
```bash
npx serve .
```
And open the link output in your terminal.
