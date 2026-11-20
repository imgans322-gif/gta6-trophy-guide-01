# Leonida Legend — GTA VI Trophy Guide & Tracker

![Competition badge](https://make.fun/badge/gta6-trophy-guide-01.svg)
![Rank badge](https://make.fun/badge/gta6-trophy-guide-01/imgans322-gif/gta6-trophy-guide-01/rank.svg)
![Reward badge](https://make.fun/badge/gta6-trophy-guide-01/imgans322-gif/gta6-trophy-guide-01/reward.svg)

My entry for the make.fun bounty [gta6-trophy-guide-01 — Build the best GTA 6 trophy guide](https://make.fun/c/gta6-trophy-guide-01): an offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden on PlayStation).

## What the app does

- **Checklist of all 55 trophies** with each official name, description and grade, earned checkboxes, and overall plus per-grade progress counts and percentages.
- **A guide for every trophy**, written for this entry in my own words — what to do, where and how, and when it can be missed — with its sources named beside it (PSNProfiles, PowerPyx, PlayStationTrophies.org, Exophase). Selecting any trophy opens its guide and sources in the side panel.
- **Platinum roadmap in five stages**, built from the official descriptions: story chapters and named missions first, then stranger strands, collectibles and exploration (card sets, 18 meditation spots, 52 areas, 100 vehicles), activities and feats (250 stunts, 42 Shooting Range golds, 14 drone races), and finally money, cleanup and 100% completion.
- **Missable flags, prominently** — seven trophies that hang on one-time story beats, choices or a unique hunt are flagged in the list, in their guides, and in the roadmap.
- **Filters by kind** (story / missable / collectibles / activities / online — the official list has no online trophies, and the app says so), by grade, plus a text search.
- **Spoiler setting** that hides the names and descriptions of story trophies until they are earned.
- **Progress saved in the browser** (localStorage), with export to a JSON file and import back.
- Fully static and offline: the app loads only its own files under `app/` and makes no network requests. No Rockstar logos, artwork or game screenshots — original styling with system fonts only.

## How to use it

Run `node serve.ts` and open http://localhost:8080, or serve the `app/` folder with any static file server and open `index.html`. Tick trophies off as you earn them; click a trophy to read its guide; use the kind chips, grade selector and search to find things; export your progress file before switching browsers, and import it afterwards.

Deep links for screenshots and sharing: `?grade=silver` pre-filters by grade, `?kind=missable` shows only missables, `?spoiler=1` starts with spoilers hidden, and `?open=<trophy id>` opens a specific guide.

## Handing it in

`node main.ts` (with `MAKEFUN_OUTPUT_DIR` set outside the grader) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library in `vendor/makefun-frontend.ts`, which is the kit's copy, unchanged.
