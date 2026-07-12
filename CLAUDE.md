# Dinner Planner — Project Instructions

This project is for building and maintaining a dinner planning web app (dinner-planner.html). Act as a creative and technical collaborator. Help add features, fix bugs, and improve the design. Explain code changes in plain language that someone with basic coding knowledge can understand — the goal is to learn as we build.

## Files
- `dinner-planner.html` — the entire app lives here (HTML + CSS + JS in one file)
- `index.html` — always a copy of dinner-planner.html (required for GitHub Pages)
- **After every change:** `cp dinner-planner.html index.html` then push to GitHub

## GitHub & Terminal
- Repo: github.com/brieespo/dinner-planner
- Live site: https://brieespo.github.io/dinner-planner
- GitHub username: brieespo
- Always use this full push command (the `rm` line clears a lock file that frequently gets stuck):
  ```
  rm ~/Claude/Projects/Life\ Coach/.git/HEAD.lock 2>/dev/null && cd ~/Claude/Projects/Life\ Coach && git add -A && git commit -m "describe changes" && git push
  ```
- If the user just runs `git push` without `git add -A && git commit`, nothing gets sent — remind them to use the full command

## Tech Stack
- Pure HTML + CSS + JavaScript (no frameworks, no npm, no build tools)
- Supabase for auth and cloud storage (user signs in with email)
- User data stored in `user_data` table with jsonb columns: `recipes`, `tags`, `rules`, `display_name`
- `rules` column also stores saved menus as `rules._savedMenus`
- No external JS libraries except the Supabase client

## App Architecture (key things to know)
- `const R = [...]` — the hardcoded "seed" recipe array (~63 recipes, IDs 1–71 with some gaps)
- `let nextId = 72` — next recipe ID to assign (hardcoded, NOT `R.length + 1` — IDs have gaps)
- `const SEED_RECIPES = R.map(r=>({...r}))` — snapshot of R taken before cloud data loads
- Recipes with `seed:true` are hidden from the Community tab
- Recipes with `saved_from` were imported from Community and don't re-upload
- `SAVED_MENUS` stored in `rules._savedMenus` in Supabase
- Recipe `type` field controls which tab: `'main'`, `'side'`, `'dessert'`, `'condiment'`, `'breakfast'`, `'lunch'`, `'snack'`
- Recipe `tags` array is cosmetic only — type handles categorization

## Tags (hardcoded TAGS array)
Side dish and condiment were removed from the hardcoded TAGS since `type` handles those now:
```js
let TAGS = [
  {id:'daughter-approved', label:'Kid-friendly', emoji:'⭐'},
  {id:'vegetarian',        label:'Vegetarian',   emoji:'🌿'},
  {id:'fiber',             label:'Fiber',        emoji:'🥬'},
  {id:'healthy-fats',      label:'Healthy fats', emoji:'🥑'},
  {id:'slow-cooker',       label:'Slow Cooker',  emoji:'🥘'},
  {id:'dessert',           label:'Dessert',      emoji:'🍰'},
  {id:'breakfast',         label:'Breakfast',    emoji:'🌅'},
  {id:'snack',             label:'Snack',        emoji:'🥪'},
];
```

## GitHub Actions
Workflow file: `.github/workflows/deploy.yml`
All actions are on Node 24-compatible versions:
- `actions/checkout@v5`
- `actions/configure-pages@v6`
- `actions/upload-pages-artifact@v5`
- `actions/deploy-pages@v5`

## Coding Style
- Match the existing style: CSS variables for theming, card-based UI, mobile-friendly
- Vanilla JS only
- Keep everything in one file
- Short variable/function names are fine (existing code uses this style)

## Design language (suite-wide rules)

- **No emoji in UI chrome.** Buttons, menus, headers, tab labels use inline SVG line icons (Lucide/Feather style, open-licensed, pasted as inline <svg> with stroke="currentColor" so they tint via CSS variables). No icon library or CDN.
- **Status markers are CSS dots/chips** in the theme palette, never colored emoji.
- **One identity mark**: a single logo glyph in the header is the only decorative one on screen.
- Emoji is allowed in user-defined content (tags, notes) — data, not chrome.
- Warmth via accent colors, rounded cards, micro-copy voice — not decoration.

## Model escalation

If a task appears to exceed your ability — a fix has failed twice, architectural uncertainty, or a risky data-model change — say so explicitly and recommend rerunning on a more capable model (/model fable) instead of continuing to attempt it.
