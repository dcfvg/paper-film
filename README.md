# 🎞️ Paper Film

**Turn any film or video and its subtitles into a polished, printable contact sheet — a visual storyboard of every line of dialogue.**

Paper Film finds the exact frame where each subtitle appears, captures a clean still, and lays those frames out in a print‑ready grid that’s easy to read and annotate. Use it to preview edits, build classroom handouts, or turn dialogue-driven moments into tangible, shareable photo‑novellas.

## 🚀 Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173 and drop a video (MP4, MOV, MKV, WebM…) along with its SRT or VTT file. Paper Film does the rest.

### Install as a PWA

Paper Film is a full Progressive Web App that you can install on any device:

**Desktop (Chrome, Edge, Brave):**

1. Open Paper Film in your browser
2. Look for the install icon (⊕) in the address bar or click the "Install" prompt
3. Click "Install" and Paper Film will appear as a standalone app

**Mobile (iOS Safari):**

1. Open Paper Film in Safari
2. Tap the Share button (□↑)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

**Mobile (Android Chrome):**

1. Open Paper Film in Chrome
2. Tap the three-dot menu (⋮)
3. Tap "Add to Home screen" or "Install app"
4. Tap "Install"

**PWA Benefits:**

- ⚡ **Offline mode** – Works without internet after first load
- 🔄 **Auto-updates** – New versions install automatically in the background
- 📱 **Native experience** – Launches like a regular app, no browser UI
- 💾 **Local storage** – All your settings persist across sessions
- 🚀 **Faster loading** – Cached assets for instant startup

## ✨ Highlights

- **📱 Progressive Web App** – Install on desktop or mobile, works offline, and auto-updates in the background
- **Contact-sheet ready** – capture frames exactly at subtitle cues so every balloon of dialogue has an anchor image.
- **Fluent captions** – merge lines across cuts, protect quotes and short utterances, and add ellipses only when a sentence is forced to breathe.
- **Color-bar aesthetics** – Paper Film's UI mirrors the five-bar palette of the exported sheet, so what you see is what you print.
- **Press-friendly output** – page formats A3–Letter, portrait/landscape grids, optional timecodes, and a one-click print/export button.
- **100% local** – videos and subtitles never leave your browser; no uploads, no waiting on servers.

## 🧩 Tech stack

- React 18 + TypeScript + Vite 7
- React Dropzone for file handling
- HTML5 Video + Canvas for frame extraction
- Vitest + Testing Library
- ESLint + Prettier

## 🛠️ Scripts

```bash
npm run dev       # Development with HMR
npm run build     # Production build
npm run preview   # Preview the build output
npm run test      # Unit tests
npm run lint      # ESLint checks
```

## 🗂️ Project map

```
src/
├── components/       # UI (dropzone, config panel, preview, print options…)
├── hooks/            # useFrameCapture (video capture pipeline)
├── utils/            # subtitle parsing + selection logic
├── types/            # shared TypeScript types
└── test/             # Vitest specs
```

## 📜 License

MIT © Paper Film
