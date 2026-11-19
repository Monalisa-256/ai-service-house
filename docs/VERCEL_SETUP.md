# AI Service House — Vercel setup

**Status:** configuration for the first deployable interface. Phase 1 is a Node-based scenario engine and documents; it has no Vite application or `build` script. Do not create a production deployment from the current empty GitHub repository.

## When to connect

Connect Vercel after (1) `Monalisa-256/ai-service-house` contains the extracted Phase 1 files and (2) Phase 2 adds a Vite application with `index.html`, `src/main.tsx`, and a working `npm run build` producing `dist/`. The 2D route should show a meaningful lesson even before 3D assets exist.

## Project import settings

| Setting | Value |
|---|---|
| Team | `kabuusumohammed182-7875's projects` (`team_GOemeQfLqdeQvRWqtEgaWSyf`) |
| Project name | `ai-service-house` |
| Git provider | GitHub |
| Repository | `Monalisa-256/ai-service-house` |
| Production branch | `main` |
| Root directory | Repository root (`./`) |
| Framework preset | Vite |
| Install command | `npm install` (or let Vercel detect the lockfile/package manager after Phase 2) |
| Build command | `npm run build` |
| Output directory | `dist` |
| Environment variables | None for the deterministic core |
| Serverless functions / database | None for the core |
| Preview deployments | Enabled for non-production branches and pull requests |

Vercel can detect Vite defaults; explicitly setting build/output is useful only if auto-detection differs. The current Phase 1 `package.json` does not contain a build script, so the build setting is **future configuration**, not something to apply to the current commit. [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite) · [Build configuration](https://vercel.com/docs/builds/configure-a-build)

## Phase 2 package scripts to add

The web phase should add Vite, React, React DOM, TypeScript, and matching type definitions, then define a build script. A representative `package.json` script block is:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "validate": "node src/validate.ts",
    "test": "node --test test/*.test.ts",
    "check": "npm run validate && npm test && npm run build"
  }
}
```

This is a design target; the exact TypeScript project configuration and script paths will be verified during Phase 2. Commit a lockfile and use the matching package manager in Vercel. Do not add a provider API key to the browser. The core simulation has no secret or runtime environment variable.

## Routing and assets

If the first interface uses client-side paths such as `/briefing` and `/library`, configure an SPA fallback so direct visits return `index.html`. Vercel's Vite guide gives the following rewrite, and its routing documentation says existing filesystem files take precedence. Verify direct URL refresh and static assets on a preview deployment. If Phase 2 uses hash routes or a framework with its own routing, do not add an unnecessary rewrite. Load room GLBs lazily when 3D arrives in Phase 3; the 2D lesson and HTML controls should render without waiting for them.

An optional Vite SPA configuration, **only if client-side history routes are selected**, is:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This pattern must be tested against actual routes and any future API routes; do not commit a rewrite before routing is chosen. [Vercel Vite SPA routing](https://vercel.com/docs/frameworks/frontend/vite)

## Deployment and access

Vercel's Git integration can deploy pushes and pull requests once the repository is linked. Keep the platform's default deployment protection initially, review the production/preview access behavior, and change it deliberately when the public educational site is ready. Do not assume a public GitHub repository makes the Vercel deployment public; these are separate settings. [Git deployments](https://vercel.com/docs/git) · [Deployment protection](https://vercel.com/docs/deployment-protection)

The Vercel GitHub namespace for `Monalisa-256` is visible to the connected Vercel account, but repository-specific import access has not yet been tested. If the new repository is not offered in Vercel, grant the Vercel GitHub app access to it through the GitHub installation settings, then retry import. This is separate from the ChatGPT GitHub connector's access.

## First deployment verification

1. Vercel build succeeds from `main`, with `dist/` generated.
2. The opening page and 2D Saturday lesson load without WebGL.
3. Direct visit and refresh of each chosen route work.
4. The current notice produces the supported answer; removing it changes appointment status to unverified.
5. No tool fixture claims a booking occurred.
6. Preview and production access match the intended audience.
7. No secrets, real user data, or live calendar requests appear in the browser bundle.

**Decision:** defer creating a Vercel project until the repository has a deployable Phase 2 app. The connected Vercel tooling can then create a Git-linked project and verify the preview deployment. This avoids a project whose first deployment is knowingly empty or broken.
