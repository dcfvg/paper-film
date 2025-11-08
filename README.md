# 🎞️ Paper Film

**Turn any video and its subtitles into a polished printable contact sheet.**

Paper Film captures the perfect still for each subtitle, redistributes the dialogue when needed, and lays everything out in a friendly, print‑ready grid. Think of it as a photo novella generator for your edits, research work, or classroom handouts.

## 🚀 Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173 and drop a video (MP4, MOV, MKV, WebM…) along with its SRT or VTT file. Paper Film does the rest.

## ✨ Highlights

- **Contact-sheet ready** – capture frames exactly at subtitle cues so every balloon of dialogue has an anchor image.
- **Fluent captions** – merge lines across cuts, protect quotes and short utterances, and add ellipses only when a sentence is forced to breathe.
- **Color-bar aesthetics** – Paper Film’s UI mirrors the five-bar palette of the exported sheet, so what you see is what you print.
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
