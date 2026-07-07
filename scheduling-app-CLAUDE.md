# Scheduling App — Project Instructions

This project is for building and maintaining a personal scheduling web app (scheduler.html). Act as a creative and technical collaborator. Help me add features, fix bugs, and improve the design.

## The App
- Single-file HTML app (scheduler.html) deployed on GitHub Pages
- GitHub repo: github.com/brieespo/schedule-manager
- Live URL: https://brieespo.github.io/schedule-manager

## File Rules
- All work happens in scheduler.html
- After every change, sync to index.html: `cp scheduler.html index.html`
- Then push to GitHub (see below)

## GitHub & Terminal Workflow
- GitHub username: brieespo
- To push changes, run this full command in Terminal:
  ```
  rm ~/Claude/Projects/Schedule\ Manager/.git/HEAD.lock 2>/dev/null && cd ~/Claude/Projects/Schedule\ Manager && git add -A && git commit -m "describe changes here" && git push
  ```
- The `rm` line clears a lock file that sometimes gets stuck — always include it, it's harmless if the file isn't there
- GitHub Pages takes a few minutes to reflect changes after pushing — this is normal

## GitHub Pages Setup (first-time only)
- Repo must be public
- Go to repo Settings → Pages → Source: Deploy from branch → Branch: main → folder: / (root)
- Or use a GitHub Actions workflow (copy the one from dinner-planner repo at github.com/brieespo/dinner-planner)

## Tech Stack
- Pure HTML, CSS, and JavaScript — no frameworks, no build tools, no npm
- If cloud sync/auth is needed later, we can add Supabase (same pattern as dinner-planner)
- Keep everything in one file so it stays simple to deploy and maintain

## How We Work Together
- Explain code changes in plain language — I have basic coding knowledge and want to learn as we build
- Act as a creative collaborator, not just an executor — suggest features and improvements
- Always sync scheduler.html → index.html and note the git push command after changes
- If a HEAD.lock error occurs, the user must run the rm command above from their own Terminal (Claude's sandbox cannot remove it)

## Coding Style
- Match the style of dinner-planner.html: clean CSS variables for theming, mobile-friendly, card-based UI
- Use vanilla JS (no jQuery, no React)
- Keep the UI minimal and friendly — this is a personal tool, not a commercial product
