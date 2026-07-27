# Handoff: Football Practice Timer

## Overview
A mobile app for football coaches to run a scripted practice: set up a block-by-block schedule (label + duration per block), then run a live countdown that auto-advances through blocks with a sound + full-screen color alert in the last 5 seconds of each block. Supports multiple color themes, an editable schedule (any number of blocks, 1–60 min each), a practice title, and importing a schedule from an uploaded PDF or Excel file.

## About the Design Files
The file in this bundle (`Football Practice Timer.dc.html`) is a **design reference / interactive prototype built in HTML**, not production code to copy directly. It runs standalone in a browser (open it directly) so you can see and click through the real behavior. The task is to **recreate this design in the target codebase's environment** — React Native / Swift / Kotlin / Flutter / PWA, whichever the team decides — using that stack's own patterns, not by embedding this HTML.

## Fidelity
**High-fidelity.** Colors, type, spacing, and all interaction logic (timer countdown, auto-advance, theme switching, schedule editing) are final — implement pixel- and behavior-accurate to this prototype. Exact values are listed below so nothing has to be re-derived from screenshots.

## Screens / Views

### 1. Setup screen (`phase === 'setup'`, default on load)
**Purpose:** Coach builds/edits the day's schedule before starting.
**Layout:** Single-column phone screen, 390×844 reference size, 32px corner radius, vertical flex.
- Header row (24px/22px/14px padding, space-between): team logo (transparent PNG, ~28px tall) + editable practice title text, left; when NOT in setup, block counter + Edit + New buttons appear on the right (hidden during setup).
- Theme swatch row: 4 circular swatches, 22px diameter, 8px gap, 2px border (border = theme text color when selected, transparent otherwise). Tapping a swatch switches the whole app's color theme instantly.
- "Set Up Practice" heading (800 weight, 14px).
- Title text input (editable, updates header title live).
- "Import schedule from PDF or Excel" label + native file input (accepts .pdf, .xlsx, .xls).
- Scrollable list of block rows, each: block number (12px, muted), text input (block label, flex:1), number input (duration in minutes, width 48-52px, min 1 max 60), "min" label, and a "×" remove button.
- Footer buttons: "+ Add Block" (outlined, flex:1) and "Start Practice" (solid accent fill, flex:2) side by side, 10px gap.

### 2. Running screen (`phase === 'running'`)
**Purpose:** Live countdown during practice.
**Layout:** Same phone shell.
- Header: logo + title (left), block counter "Block N / total" + "Edit" button (opens schedule-edit modal, pauses timer) + "New" button (resets to a fresh setup screen), all right-aligned.
- Theme swatch row (same as setup, always visible).
- Main countdown area (flex:1, centered content): huge countdown mm:ss (800 weight, 104px, tabular-nums), a rounded label tag showing the current block's name, and a smaller "Next: Block N — label" line (or "Final block" on the last one).
- **Alert state** (last 5 seconds of a block): the entire countdown area's background flips to the theme's accent color as a full flood, with text flipping to the theme's accentText color — this is the primary visual/audio cue a block is ending.
- Footer: "Sound On"/"Sound Off" toggle (right-aligned small text), then Back button (outlined, flex:1) and Pause/Resume button (solid accent, flex:2).

### 3. Schedule-edit modal (overlay, `showEditor === true`)
Same row-list UI as the setup screen's block list (add/remove/edit rows), shown as a centered modal over a 50%-opacity black backdrop, with a "Done" button that resumes the countdown from the current block's full duration.

## Interactions & Behavior
- **Auto-advance:** a 1-second interval ticks the countdown down; at 0 it advances to the next block and resets to that block's duration × 60 seconds. On the last block it holds there.
- **Alert:** when `secondsLeft <= 5`, the main area flips to the accent-flood state described above. A short beep (Web Audio oscillator, ~520Hz) fires each second in the last 4 seconds, and an 880Hz beep fires on block advance — gated by the Sound On/Off toggle.
- **Pause/Resume:** stops/resumes the interval's countdown only (does not reset time).
- **Back:** returns to the previous block and resets its timer to full duration (does not just rewind seconds).
- **Edit (mid-practice):** opens the modal, pauses the timer; "Done" closes it and resets the current block's remaining time to its (possibly just-edited) full duration.
- **New:** resets schedule to the default 16-block template and title, returns to the setup screen.
- **Theme switch:** instant, no transition beyond the existing 0.2s background-color transition on themed elements.
- **Schedule import:** reads the uploaded file (PDF via text extraction, XLSX via SheetJS), heuristically finds rows of the form `<block number> <time> <drill text...>`, derives each block's duration from the gap to the next block's start time, and replaces the schedule. This is explicitly best-effort — the UI expects the coach to review/edit the imported rows before starting, so no destination stack needs to reproduce the parsing precisely; a simpler "map spreadsheet rows to blocks" import is an acceptable simplification if the parsing heuristic is impractical in the new environment.

## State Management
- `theme`: one of `navyGold` (default) | `crimson` | `steel` | `slate`.
- `blocks`: ordered array of `{ n, dur (minutes), label }`, variable length (not fixed at 16).
- `title`: free text practice title.
- `phase`: `'setup' | 'running'`.
- `i`: index of current block; `secs`: seconds remaining in current block.
- `running`: boolean, whether the countdown interval is active.
- `sound`: boolean, alert sound on/off.
- `showEditor`: boolean, mid-practice schedule modal open/closed.

## Design Tokens

### Themes (bg / text / accent / accentText / muted-text / tag-bg / tag-text)
- **navyGold (default):** `#0b1a33` / `#f4efe2` / `#d4af37` / `#0b1a33` / `rgba(244,239,226,0.55)` / `rgba(212,175,55,0.16)` / `#d4af37`
- **crimson:** `#f5f2ef` / `#1c1a19` / `#c81d25` / `#fff` / `rgba(28,26,25,0.55)` / `#fbe4e4` / `#a3161c`
- **steel:** `#eef1f4` / `#16202c` / `#3a6ea5` / `#fff` / `rgba(22,32,44,0.55)` / `#dde6ef` / `#2c567f`
- **slate:** `#161826` / `#e9e9ed` / `#9184d9` / `#161826` / `rgba(233,233,237,0.5)` / `rgba(145,132,217,0.18)` / `#b3aae8`

In the alert state, main-area background = theme accent, text = theme accentText, tag background = `rgba(255,255,255,0.2)`, tag text = accentText.

### Typography
- Font: Archivo (Google Fonts), weights 400/600/800.
- Countdown: 800 weight, 104px, line-height 1, tabular-nums.
- Header title: 800 weight, 12px, letter-spacing 0.1em, uppercase.
- Block/UI labels: 800 weight, 12–14px.
- Body/muted text: 400 weight, 13px.

### Spacing / shape
- Phone frame: 390×844 reference, 32px border-radius, drop shadow `0 20px 50px rgba(0,0,0,0.25)`.
- Standard padding: 22–24px horizontal on major sections.
- Buttons/inputs: 8px border-radius, ~12–14px vertical padding.
- Swatches: 22px circles, 2px border.

## Assets
- `assets/team-logo.png` — team logo, background already keyed to transparent. Source was a user-provided PNG (`uploads/LNYF_1.png`) with a chrome/eagle mark on white; white was chroma-keyed out.

## Files
- `Football Practice Timer.dc.html` — the full interactive prototype (open directly in any browser to click through it).
- `assets/team-logo.png` — the transparent logo asset used in the header.
