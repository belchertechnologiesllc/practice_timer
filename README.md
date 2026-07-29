# Practice Timer

A mobile web app for coaches to run a scripted practice: build a block-by-block
schedule (label + duration per block), then run a live countdown that
auto-advances through blocks with a sound + full-screen color alert in the
last 5 seconds of each block.

It's a installable PWA (Progressive Web App) — coaches add it to their
phone's home screen and it opens full-screen, works offline, and keeps the
screen awake and the countdown accurate even if the phone is put down or
locked mid-practice.

Design reference: [`design_handoff_practice_timer/`](./design_handoff_practice_timer).

## Features

- Landing screen on open (team logo + "Get Started") before the setup screen.
- Editable schedule: any number of blocks, 1–60 min each, drag-to-reorder in both the setup screen and the mid-practice editor.
- Import a schedule from an uploaded PDF or Excel file (best-effort — review after import).
- Navy/gold color theme.
- A countdown audio clip plays at 15 seconds remaining in a block, plus the full-screen color alert in the last 5 seconds and a beep on block change.
- Pause/Resume, Back (restart previous block), Skip (end the current block early and jump to the next), and mid-practice schedule editing.
- Keeps the screen awake while a practice is running (Screen Wake Lock API).
- Timestamp-based countdown that resyncs correctly after the phone locks or the tab is backgrounded.
- The whole app state (schedule, current block, remaining time, running/paused) is persisted to localStorage and restored from wall-clock time on reload — so it picks back up correctly even if the phone's screen locks, the app is switched away from, or the browser fully reloads the page (mobile browsers often do this to backgrounded tabs to save memory).
- Installable to a phone's home screen; works offline after first load.

## Developing

```bash
npm install
npm run dev
```

Open the printed local URL. To try it as it will behave on a phone, open dev
tools' device toolbar, or visit the URL from an actual phone on the same
network (Vite prints a "Network" URL when you pass `--host`):

```bash
npm run dev -- --host
```

## Building

```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally
```

## Hosting

This is a static site — `npm run build` produces a `dist/` folder you can
host anywhere that serves static files (Netlify, Vercel, Cloudflare Pages,
GitHub Pages, S3, etc). No server/backend is required.

### GitHub Pages (included workflow)

`.github/workflows/deploy.yml` builds and deploys `main` to GitHub Pages
automatically. To turn it on:

1. In the repo's **Settings → Pages**, set **Source** to "GitHub Actions".
2. Push to `main` — the workflow builds the app and publishes `dist/`.

The workflow sets `VITE_BASE_PATH` to the repo's Pages subpath automatically,
so the same code works whether it's hosted at a domain root or under
`https://<user>.github.io/<repo>/`.

### Any other static host

```bash
npm run build
```

Upload the contents of `dist/` to your host. If it's served from a subpath
rather than the domain root, set `VITE_BASE_PATH` before building, e.g.:

```bash
VITE_BASE_PATH=/practice-timer/ npm run build
```

### Installing on a phone

Once hosted, open the URL in Safari (iOS) or Chrome (Android) and use
"Add to Home Screen" — the app installs with its own icon and opens
full-screen like a native app.
