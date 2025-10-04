# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Codebase Overview

This is a Chinese astronomy web application called "天体图文" (Astronomical Graphics) that displays planetary positions, lunar phases, and traditional Chinese calendar information. The application runs entirely in the browser using client-side JavaScript.

## Architecture

### Core Files
- `planet.html` - Main HTML entry point containing the Vue.js application interface
- `astronomy.browser.js` - Third-party astronomy calculation library (cosinekitty/astronomy)
- `lunar.js` - Chinese calendar and lunar phase calculation library
- `vue3.js` - Vue.js 3 framework for reactive UI components
- `jupiter.png` & `saturn.png` - Planet images used in the visualization

### Application Structure
The application is a single-page web application that:
1. Uses Vue.js for reactive UI components and data binding
2. Leverages the astronomy.js library for accurate planetary position calculations
3. Integrates lunar.js for traditional Chinese calendar features (24 solar terms, 28 lunar mansions, etc.)
4. Provides interactive controls for configuring display options (orbit modes, viewing angles, calendar overlays)

### Key Features
- Planetary orbit visualization with trajectory modes
- Top-down and side view switching
- 24 solar terms (24节气) display with clockwise/counterclockwise options
- 28 lunar mansions (28宿) visualization
- Traditional Chinese calendar systems (12-month and 10-month calendars)
- Interactive controls with keyboard shortcuts

## Development

### Running the Application
Since this is a client-side web application, simply open `planet.html` in a web browser. No build process or server is required.

### Making Changes
1. Edit `planet.html` for UI/structure changes
2. Modify JavaScript code within the `<script>` tags in planet.html
3. Update CSS styles in the `<style>` section of planet.html
4. Add/modify assets (images) in the root directory

### Dependencies
- Vue.js 3 (loaded via vue3.js)
- Astronomy.js library (astronomy.browser.js v2.4)
- Lunar.js library for Chinese calendar calculations

All dependencies are included locally in the repository - no package management needed.

### No Build Process
This project does not use any build tools, package managers, or testing frameworks. It's a pure client-side application that can be developed and tested directly in the browser.