# Vanilla Tables

Fast, framework-agnostic data tables in pure JavaScript.

[![CI](https://github.com/lhozdroid/vanilla-tables/actions/workflows/ci.yml/badge.svg)](https://github.com/lhozdroid/vanilla-tables/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/vanilla-tables.svg)](https://www.npmjs.com/package/vanilla-tables)
[![npm downloads](https://img.shields.io/npm/dm/vanilla-tables.svg)](https://www.npmjs.com/package/vanilla-tables)

Vanilla Tables is an object-oriented table engine designed for real apps: rich features, extensible API, production-safe behavior, and strong test coverage.

## Why Vanilla Tables

- No framework lock-in: works with plain HTML, React, Vue, Angular, Svelte, or any SSR/CSR stack.
- Feature-complete table core: search, filters, sorting, paging, fixed regions, row expansion/editing/actions.
- Built for production: worker projection with timeout/retry/fallback, resilient state flow, and release verification gates.
- Theme-ready: raw semantic output by default, plus framework-focused theme plugins.

## Install

```bash
npm install vanilla-tables
```

## Quick Start (npm)

```js
import { createVanillaTable, bootstrapThemePlugin } from 'vanilla-tables';
import 'vanilla-tables/styles';

const rows = [
  { id: 1, name: 'Alice', city: 'NYC', score: 45 },
  { id: 2, name: 'Bob', city: 'Paris', score: 20 }
];

const table = createVanillaTable(document.querySelector('#table-root'), rows, {
  pageSize: 10,
  searchable: true,
  columnFilters: true,
  multiSort: true,
  rowActions: [
    {
      id: 'approve',
      label: 'Approve',
      onClick: ({ row }) => console.log('approve', row)
    }
  ]
});

table.use(bootstrapThemePlugin());
```

## Quick Start (CDN)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vanilla-tables/dist/vanilla-tables.css" />
<script src="https://cdn.jsdelivr.net/npm/vanilla-tables/dist/vanilla-tables.min.js"></script>
<script>
  const table = new VanillaTables.VanillaTable(document.querySelector('#table-root'), data, {
    fixedHeader: true,
    fixedFooter: true,
    fixedColumns: 1
  }).init();
</script>
```

## Core Features

- Global search
- Per-column filters
- Single and multi-sort
- Paging with configurable sizes
- Expandable rows
- Editable rows/cells
- Row actions and action dropdown plugin
- Fixed header/footer/columns/top rows
- Column resize and reorder
- Virtual scrolling
- URL + local persistence sync
- Server-side mode (REST/GraphQL/cursor adapters)
- Event system across all major interactions
- i18n via configurable labels

## Performance + Reliability

- Adaptive worker projection engine for heavy query workloads.
- Worker controls: `threshold`, `workers`, `timeoutMs`, `retries`.
- Graceful degradation to sync path if workers fail or timeout.
- Stress + e2e + unit coverage pipeline.
- Release verification script for dist artifacts, exports, size budgets, and tarball contents.

## Theming

Default output is semantic and framework-neutral (`vt-*`).

Built-in theme plugins:

- `bootstrapThemePlugin()`
- `bulmaThemePlugin()`
- `muiThemePlugin()`
- `tailwindThemePlugin()`

## Production Tuning

```js
const table = createVanillaTable(root, rows, {
  parallel: {
    enabled: true,
    threshold: 20000,
    workers: 'auto',
    timeoutMs: 4000,
    retries: 1
  }
});
```

## API Highlights

Main instance methods:

- `init()`, `refresh()`, `destroy()`
- `setData(rows)`, `addRow(row)`, `removeRowById(rowId)`
- `search(term)`, `filterBy(key, value)`, `clearFilters()`
- `sortBy(key, direction?, additive?)`, `clearSort()`
- `goToPage(page)`, `setPageSize(size)`
- `expandRow(rowId)`, `collapseRow(rowId)`, `toggleRow(rowId)`
- `updateCell(rowId, key, value)`
- `setColumnWidth(key, width)`, `reorderColumns(order)`
- `setColumnVisibility(key, visible)`, `toggleColumnVisibility(key)`
- `setThemeClasses(classes)`
- `getState()`, `setState(payload)`, `getView()`, `getRows()`
- `on(event, callback)`, `use(plugin)`, `registerHook(name, callback)`

## Events

Includes lifecycle, state, table interactions, data, and error/loading events.

Examples:

- `init`, `change`, `state:change`, `destroy`, `error`
- `search:change`, `filter:change`, `sort:change`, `page:change`
- `row:expand`, `row:collapse`, `row:edit`, `row:action`
- `column:resize`, `column:reorder`, `column:visibility`
- `data:set`, `data:add`, `data:remove`

## Demos

- Index: `demo/index.html`
- Individual pages: vanilla, bootstrap, bulma, mui-like, tailwind

Run locally:

```bash
node tests/e2e/server.mjs
```

Then open `http://127.0.0.1:4173/demo/index.html`.

## Scripts

- `npm run build`
- `npm run test`
- `npm run coverage`
- `npm run test:e2e`
- `npm run test:e2e:matrix`
- `npm run test:e2e:perf`
- `npm run stress`
- `npm run bench:memory`
- `npm run release:verify`

## Release Gate

Before publishing:

```bash
npm run build
npm run test
npm run test:e2e:perf
npm run release:verify
```

## Publish To npm + CDN

1. Login locally:

```bash
npm login
```

2. Publish:

```bash
npm publish --access public
```

3. CDN availability:
- jsDelivr: `https://cdn.jsdelivr.net/npm/vanilla-tables/dist/vanilla-tables.min.js`
- unpkg: `https://unpkg.com/vanilla-tables/dist/vanilla-tables.min.js`

The package already exposes `unpkg` and `jsdelivr` fields in `package.json`.

## How To Grow Adoption

- Keep examples strong: add short recipe pages for the top 10 use-cases.
- Add comparison docs: “Vanilla Tables vs DataTables/Tabulator/AG Grid”.
- Ship copy-paste snippets for React/Vue/Angular wrappers.
- Keep release notes tight and frequent (`v0.x` with clear changelogs).
- Add benchmark page with reproducible methodology and raw numbers.
- Label and respond to issues quickly to build maintainer trust.
- Add “good first issue” labels and contributor onboarding tasks.
- Publish short demo videos/gifs for key features.

## Contributing

PRs are welcome. Keep changes test-backed and consistent with project principles:

- clear API surface
- performance-focused data paths
- graceful degradation behavior
- documented internals and public usage

## Project Health

- Changelog: `CHANGELOG.md`
- Code of Conduct: `.github/CODE_OF_CONDUCT.md`
- Security policy: `.github/SECURITY.md`
- Support guide: `.github/SUPPORT.md`

## License

MIT
