
# Lumen Astro Tech

Brief documentation for local development and the tech stack used by this repository.

## Tech Stack

- **Framework:** `Astro` — static site / hybrid rendering framework (see `astro.config.mjs`).
- **Language:** `TypeScript` (project uses `.ts` and `.astro` files; `tsconfig.json` extends `astro/tsconfigs/strict`).
- **Runtime / Package manager:** `Node` + `npm` (see `package.json` scripts).
- **Content system:** `astro:content` collections for Markdown content (see `src/content.config.ts` and `src/content/work`).
- **Styling:** plain CSS (`src/styles/global.css`). No CSS framework is declared in `package.json`.

## Important Files

- `package.json` — npm scripts and dependencies.
- `astro.config.mjs` — Astro configuration.
- `tsconfig.json` — TypeScript configuration.
- `src/content.config.ts` — content collections and schemas for Markdown.
- `src/pages/`, `src/components/` — site pages and UI components.

## Local development

Recommended quick start (from repository root):

```bash
npm install
npm run dev
```

Common commands:

- `npm run dev` — Start the Astro dev server with hot reload.
- `npm run build` — Build the site for production.
- `npm run preview` — Preview the production build locally (run after `npm run build`).
- `npm run start` — Alias for `npm run dev`.
- `npm run typecheck` — Run TypeScript checks (`tsc --noEmit`).
- `npm run format` — Run Prettier to format files (uses `npx prettier --write .`).

Notes:

- The repository currently lists `astro` as a dependency in `package.json`. If you plan to use the `format` script (Prettier) or other tooling (ESLint, stylelint), install them as devDependencies, for example:

```bash
npm install -D prettier eslint
```

If you'd like, I can add recommended devDependencies and enable lint/format configuration files.

