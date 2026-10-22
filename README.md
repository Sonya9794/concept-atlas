# Concept Atlas

Concept Atlas is an interactive map for studying how mathematical ideas relate.

## Current status

Stage 1 establishes the React and TypeScript foundation, the map data model, and
a selectable sample map with pan and zoom. Editing, persistence, and rendered
LaTeX are intentionally reserved for later stages in the project brief.

## Local development

```sh
pnpm install
pnpm dev
```

The development server prints the local URL to open in a browser.

## Checks

```sh
pnpm lint
pnpm build
```

The production build is written to `dist/`.
