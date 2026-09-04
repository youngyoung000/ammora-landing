# Ammora Landing

A responsive landing page prototype for Ammora's onchain liquidity infrastructure. The implementation follows the Ammora waitlist visual system and includes the final desktop and mobile layouts, interactive hero treatment, product infographics, and production-ready image assets.

## Run locally

```bash
npm ci
npm run dev
```

Vite will print the local preview URL in the terminal.

## Production build

```bash
npm run build
npm run preview
```

## Stack

- React
- Vite
- WebGL and CSS for the interactive hero and liquidity scenes
- Nunito Sans for display type and Manrope for body copy

## Project structure

- `src/App.jsx` — page sections, content, and interaction logic
- `src/WaitlistPage.jsx` — points, missions, referral, leaderboard, and reward page at `/waitlist`
- `src/LiquidityScene.jsx` — real-time 3D ALMM and ARL WebGL scenes
- `src/design-system/tokens.css` — shared color, type, spacing, shape, and motion tokens
- `src/design-system/primitives.css` — reusable layout and component primitives
- `src/design-system/index.jsx` — theme hook and reusable React components
- `src/design-system/README.md` — usage rules and a new-page example
- `src/redesign.css` — landing-specific composition and artwork styles
- `src/waitlist.css` — waitlist-specific responsive composition
- `public/` — optimized landing-page artwork and UI mockups
- `index.html` — page metadata and webfont setup

## Frontend handoff notes

- The page is responsive across desktop, tablet, and mobile breakpoints.
- Motion respects the user's `prefers-reduced-motion` setting.
- Product values shown in interface mockups are presentational sample data.
- Replace prototype CTA targets with production routes when those destinations are available.
