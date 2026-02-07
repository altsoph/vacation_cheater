# Vacation Cheater

**Squeeze the most days off from your vacation budget.**

A pure client-side vacation optimizer that finds bridge days between public holidays and weekends, then fills them with a greedy algorithm. No backend, no signup, no tracking — just HTML + CSS + JS.

**Live:** [altsoph.com/pp/vc](https://altsoph.com/pp/vc/)

---

## How It Works

1. **Pick your country and state** — holidays are fetched from two APIs and cross-referenced
2. **Set your vacation budget** (e.g., 20 days) and a start date
3. **Click "Optimize"** — the greedy algorithm fills the shortest gaps first
4. **Fine-tune** by clicking individual days to add/remove vacation
5. **Export** the result as a PNG (clipboard or new tab)

## The Optimizer Algorithm

The core is a two-phase greedy approach:

**Phase 1 — Bridge days (gaps < 5 working days):**
Scans all working-day gaps between free days (weekends + holidays), sorts by length ascending, and fills the cheapest bridges first. A 1-day gap between a Thursday holiday and a Saturday costs 1 vacation day but gives you a 4-day weekend. For equal-length gaps, it prefers the one flanked by the longest free blocks (higher payoff).

**Phase 2 — Full weeks (if budget remains):**
After all bridge gaps are filled, remaining days go to the most efficient longer gaps — sorted by `(adjacent_free_days + gap_length) / gap_length`, so a Monday–Friday between two weekends (9 days off for 5 spent) is picked before isolated weeks.

## Dual Holiday API with Cross-Referencing

Two public holiday sources are queried in parallel:

| API | Role | Coverage |
|-----|------|----------|
| [OpenHolidaysAPI](https://openholidaysapi.org) | **Primary** (more precise, subdivision-aware) | 36 countries |
| [Nager.Date](https://date.nager.at) | **Secondary** (wider coverage) | 100+ countries |

Holidays confirmed by OpenHolidaysAPI are shown normally. Holidays found **only** in Nager.Date get a dashed yellow "unconfirmed" marker and a warning banner listing the mismatches. For countries not covered by OpenHolidaysAPI, Nager.Date is used as the sole source without warnings.

Regional holidays are handled via subdivision codes (e.g., `DE-BE` for Berlin). The app ships with full subdivision data for DE (16 Bundesländer), AT (9), CH (26), AU (8), CA (10), and US (50 + DC).

## Features

- **12-month calendar grid** (4×3) with Mon–Sun layout
- **Click-to-toggle** vacation days on any working day
- **Budget enforcement** — can't exceed your vacation day limit
- **Dark/light theme** — dark mode uses a retro green-on-black terminal aesthetic; light mode is a clean cream/forest-green scheme
- **Responsive** — 4 cols → 3 → 2 → 1 depending on viewport
- **Vacation stats** — streaks, longest streak, total days off, efficiency ratio (only counts blocks containing vacation days, not plain weekends)
- **PNG export** — renders title + legend + calendar + stats + copyright to a ~1200px-wide image via html2canvas
- **Custom themed checkbox** — no white squares in dark mode

## Tech Stack

- **Zero dependencies** for the app itself (vanilla JS, no framework)
- [html2canvas](https://html2canvas.hertzen.com/) loaded from CDN for PNG export only
- CSS custom properties for theming (instant dark/light switch, no re-render)
- All holiday data fetched client-side — works from `file://` or any static host

## File Structure

```
index.html    — HTML + embedded CSS (~820 lines)
app.js        — all application logic (~1300 lines)
vc_logo.png   — favicon and social preview image
```

## License

(c) [altsoph](https://altsoph.com)
