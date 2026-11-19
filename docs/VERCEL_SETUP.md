# AI Service House — Vercel setup

**Status:** Phase 2 is deployable as a static Vite site. The public GitHub repository still needs the latest ZIP extracted by the existing workflow before Vercel can import the implementation.

| Setting | Value |
|---|---|
| Repository | `Monalisa-256/ai-service-house` |
| Production branch | `main` |
| Root directory | `./` |
| Framework preset | Vite |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Environment variables | None |

The interface uses hash routes (`#/briefing`, `#/library`, `#/service-counter`), so direct links and reloads request the same root `index.html`; no SPA rewrite is needed. Static assets are emitted by Vite. No API keys or provider credentials belong in the browser.

After the extracted commit lands on `main`, import the GitHub repository into Vercel, verify the build and each hash route on the deployment, test reload and persistence, and confirm the deployment access settings match the intended public audience. The ChatGPT GitHub connector could read but could not write this repository, so extraction remains the publishing path.

References: [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite), [Vercel Git deployments](https://vercel.com/docs/git).
