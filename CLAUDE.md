# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Firefox browser extension (Manifest V3) for inspecting and debugging Ext JS 3 applications. Adds a "Ext JS 3" panel to browser DevTools with component tree visualization, property inspection, and component search.

## Commands

```bash
npm install              # Install dependencies
make                     # Full build: frontend + backend + copy template to dist/
npm run frontend         # Angular build (production) → dist/devtools/
npm run frontend-watch   # Angular build with watch (development mode)
npm run backend          # Webpack build (background, backend, page scripts) → dist/
npm run backend-watch    # Webpack build with watch
npm test                 # Run Karma/Jasmine unit tests
npm run lint             # ESLint (src/**/*.ts, src/**/*.html)
make icons               # Regenerate PNG icons from SVG (requires ImageMagick)
```

To load the extension for testing: open `about:debugging#/runtime/this-firefox` and load from `dist/`.

## Architecture

The extension has four isolated execution contexts that communicate via message passing:

```
DevTools Panel (Angular)  ←──port──→  Service Worker  ←──port──→  Content Script  ←──window.postMessage──→  Page Script
src/app/                              src/background/              src/backend/                              src/page/
```

### Build Pipeline

Two separate build systems produce the final `dist/` directory:

- **Angular CLI** (`ng build`) — builds the DevTools panel UI → `dist/devtools/`
- **Webpack** (`webpack.backend.js`) — bundles three TypeScript entry points into `dist/`:
  - `background.js` — MV3 service worker (`src/background/background.ts`)
  - `backend.js` — content script (`src/backend/backend.ts`)
  - `page.js` — injected page script (`src/page/page.ts`)
- **Template files** (`template/`) — `manifest.json`, `devtools.html`, `devtools.js`, icons — copied as-is to `dist/`

### Message Protocol

All inter-context communication uses a topic/args message format defined in `src/app/protocols/messages.ts`. The `Events` interface is the single source of truth for all message types.

- **PortBus** (`src/app/protocols/port-bus.ts`) — typed wrapper around `chrome.runtime.Port` for DevTools↔ServiceWorker communication
- **WindowBus** (`src/page/window-bus.ts`) — typed wrapper around `window.postMessage` for ContentScript↔PageScript communication
- **TabManager** (`src/background/tab-manager.ts`) — service worker hub that routes messages between DevTools ports and content script ports, keyed by tab ID and frame ID

### Page Script (`src/page/`)

Runs in the inspected page's JS context (only way to access `Ext` global):

- `detector.ts` — detects Ext JS 3 availability on the page
- `dom-manager.ts` — central coordinator; handles all message topics, manages component tree
- `forest.ts` — builds the component tree from `Ext.ComponentMgr`
- `component-inspector/` — visual overlay for highlighting/selecting components on the page
- `state-serializer/` — serializes Ext JS component state for display in DevTools

### DevTools Panel (`src/app/`)

Angular application rendered inside the DevTools panel:

- `devtools/devtools-tabs/component-explorer/` — main UI: component tree + properties panel
- `component-forest/` — tree view with filtering (by class, `name=`, `#id`)
- `properties/` — property viewer with expandable nested properties
- `services/theme.service.ts` — syncs with browser DevTools theme (dark/light)

## Conventions

- Project language is mixed: code in English, comments/commits often in Russian
- Angular components use SCSS styles
- The `@types/chrome` package provides typings for the browser extension APIs
