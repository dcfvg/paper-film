# 🎞️ Paper Film

Paper Film turns any video + subtitle file into a printable contact sheet that pairs every line of dialogue with its exact frame. It runs entirely in the browser, so nothing ever leaves your machine.

## What you can do
- 📱 **Progressive Web App** – Install on desktop or mobile, keep working offline, and let updates arrive silently in the background.
- **Contact-sheet ready** – Capture frames exactly at subtitle cues so every bubble of dialogue has an anchor image.
- **Fluent captions** – Merge lines across cuts, protect quotes and short utterances, and add ellipses only when sentences are forced to pause.
- **Color-bar aesthetics** – The UI mirrors the five-bar palette of the exported sheet so what you see is what you print.
- **Press-friendly output** – Pick A3–Letter formats, portrait/landscape grids, optional timecodes, and print/export in one click.
- **100% local** – Videos and subtitles never leave your browser; no uploads, no waiting.
- Fine-tune layout controls such as column count, typography, titles, and timecodes to get a cine-roman page that fits your project.

## How to use it
1. `npm install` then `npm run dev` (or open the hosted build if one is available).
2. Drop a video file plus its `.srt`/`.vtt` subtitles into the File Dropzone.
3. Adjust frame count, subtitle offset, font, and grid options until the preview matches your desired layout.
4. Hit **Print sheet** (browser print dialog) or export assets with your preferred workflow.

*Tip:* Add it to your home screen/desktop to cache assets for offline shoots—the app is a PWA out of the box.

## Developer quick start
```bash
npm install
npm run dev     # Vite dev server
npm run build   # Type-check + production bundle
npm run test    # Vitest suite
npm run lint    # ESLint
```

Project structure highlights:
- `src/components` – UI (dropzone, config panel, preview, prompts)
- `src/hooks` – frame capture pipeline and helpers
- `src/utils` – subtitle parsing, font detection, export helpers
- `src/test` – unit tests (Vitest + Testing Library)

## License
GNU General Public License v3.0. See `LICENSE` for details.
