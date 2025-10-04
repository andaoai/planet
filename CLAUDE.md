# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Codebase Overview

This is a Chinese astronomy web application called "天体图文" (Astronomical Graphics) that displays planetary positions, lunar phases, and traditional Chinese calendar information. The application runs entirely in the browser using client-side JavaScript with no server-side dependencies.

## Architecture

### Core Files
- `index.html` - Main HTML entry point containing the Vue.js application interface and embedded JavaScript code
- `css/styles.css` - Application stylesheet for tables and canvas elements
- `js/earthObserver.js` - Main application logic and Vue.js component for Earth-based astronomical observation
- `js/lib/astronomy.browser.js` - Third-party astronomy calculation library (cosinekitty/astronomy v2.4)
- `js/lib/lunar.js` - Chinese calendar and lunar phase calculation library
- `js/lib/vue3.js` - Vue.js 3 framework for reactive UI components
- `assets/images/jupiter.png` & `assets/images/saturn.png` - Planet images used in the visualization

### Project Structure
```
planet/
├── index.html              # Main application (HTML + embedded Vue.js code)
├── css/
│   └── styles.css          # Application styles
├── js/
│   ├── earthObserver.js    # Earth-based astronomical observation script
│   └── lib/                # Third-party libraries
│       ├── astronomy.browser.js
│       ├── lunar.js
│       └── vue3.js
└── assets/
    └── images/
        ├── jupiter.png
        └── saturn.png
```

### Application Architecture
The application is a single-page web application that:

1. **Vue.js Integration**: Uses Vue.js 3 Composition API for reactive UI components and data binding
2. **Astronomical Calculations**: Leverages the astronomy.js library for accurate planetary position calculations, ephemeris data, and celestial mechanics
3. **Chinese Calendar System**: Integrates lunar.js for traditional Chinese calendar features including:
   - 24 solar terms (24节气)
   - 28 lunar mansions (28宿)
   - 12-month and 10-month calendar systems
   - Traditional time reckoning (斗建)
4. **Canvas Visualization**: HTML5 Canvas-based rendering of celestial charts with real-time updates
5. **Interactive Controls**: Extensive keyboard shortcuts and UI controls for configuring display options

### Key Features
- **Planetary Visualization**: Real-time planetary positions with orbit modes and trajectory tracking
- **View Modes**: Top-down (equatorial/ecliptic) and side view switching with proper projections
- **Calendar Overlays**: 24 solar terms display with clockwise/counterclockwise orientation options
- **Lunar Mansions**: 28 lunar mansions visualization with traditional Chinese measurements
- **Calendar Systems**: Support for both 12-month and 10-month traditional Chinese calendars
- **Retrograde Detection**: Automatic detection and visualization of planetary retrograde motion
- **Time Navigation**: Interactive time controls with keyboard shortcuts for day/hour/minute navigation
- **Geographic Settings**: Configurable observer position (latitude, longitude, altitude)
- **Real-time Updates**: Live astronomical data with automatic refresh capability
- **Export Features**: Planetary position tables and astronomical data export

### Advanced Features
- **Stellar Catalog**: Integration of major stars including Big Dipper (北斗七星) and other significant stars
- **Horizon Coordinates**: Separate horizontal coordinate system visualization
- **True Solar Time**: Calculation and display of local apparent solar time
- **Planetary Aspects**: Angular separations between planets and planetary configurations
- **Historical Accuracy**: Accurate calculations from 1500 CE to present with proper historical calendar handling
- **Precession Effects**: Support for long-term astronomical calculations including axial precession

## Development

### Running the Application
Since this is a client-side web application, simply open `index.html` in a web browser. No build process, server, or internet connection is required for basic functionality.

### Making Changes
1. **UI/Structure Changes**: Edit `index.html` for HTML structure and embedded JavaScript
2. **Application Logic**: The main Vue.js application code is currently embedded within `<script>` tags in index.html (lines 8-2365)
3. **Styling**: Update CSS styles in `css/styles.css` or the `<style>` section of index.html
4. **Asset Management**: Add/modify images in `assets/images/` directory
5. **Code Organization**: For better maintainability, consider extracting the embedded JavaScript from index.html into `js/earthObserver.js`

### Dependencies
All dependencies are included locally in the repository:
- **Vue.js 3**: Modern reactive framework for UI components (loaded via `js/lib/vue3.js`)
- **Astronomy.js**: Professional astronomical calculation library (js/lib/astronomy.browser.js v2.4)
- **Lunar.js**: Chinese calendar calculation library (js/lib/lunar.js`)

No package management, npm install, or build process is required.

### Code Organization Notes
- The main application logic (currently ~2365 lines) is embedded directly in `index.html`
- The code uses Vue.js Composition API with reactive data management
- Extensive keyboard shortcut support for navigation and feature toggling
- LocalStorage persistence for user settings and geographic preferences
- Canvas-based rendering with proper coordinate transformations

### Keyboard Shortcuts
- **J/K**: Navigate days backward/forward
- **H**: Return to current date/time
- **I**: Toggle face/side view mode
- **O**: Toggle trajectory mode
- **U**: Toggle planetary orbit display
- **N/M**: Navigate hours backward/forward
- **D/F**: Navigate minutes backward/forward
- **Y**: Fix south direction upward
- **L**: Toggle 24 solar terms clockwise/counterclockwise
- **B**: Toggle planet-Earth connection lines
- **P**: Toggle planet data display
- **Q**: Switch between ecliptic/equatorial coordinates
- **A**: Jump to epoch date (1962-02-05)
- **Z/X/C**: Jump to specific times of day (6:00, 0:00, 18:00)
- **W**: Toggle Big Dipper viewing orientation
- **E/R**: Jump forward/backward by configurable time spans
- **T**: Toggle planet distance display
- **S**: Toggle declination/ecliptic latitude display mode
- **G**: Toggle 28 mansions 360°/365.25° measurement system

### Browser Compatibility
- Requires modern browser with HTML5 Canvas support
- Uses ES6+ JavaScript features (arrow functions, destructuring, etc.)
- Vue.js 3 provides reactive data binding and component lifecycle management