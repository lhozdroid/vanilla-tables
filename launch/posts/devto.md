# Vanilla Tables: framework-agnostic data tables in pure JavaScript

I just released **Vanilla Tables**, a pure JavaScript table library focused on production behavior and extensibility.

## Why I built it

I wanted a data-table engine that:

- does not lock teams into one UI framework
- is object-oriented and plugin-friendly
- performs well on large datasets
- degrades gracefully under failure conditions

## What it supports

- global search + per-column filters
- single and multi-sort
- paging
- expandable rows
- editable rows/cells
- row action buttons/dropdowns
- fixed header/footer/columns/top rows
- virtual scroll
- server-side mode with REST/GraphQL/cursor adapters

## Production details

- worker-based projection for heavy queries
- timeout/retry/fallback behavior
- unit + e2e + stress/memory benchmarks
- release verification (bundle/export/pack checks)

## Install

```bash
npm i vanilla-tables
```

## Links

- GitHub: https://github.com/lhozdroid/vanilla-tables
- npm: https://www.npmjs.com/package/vanilla-tables
- jsDelivr CDN: https://cdn.jsdelivr.net/npm/vanilla-tables/dist/vanilla-tables.min.js
- Release notes: https://github.com/lhozdroid/vanilla-tables/releases/tag/v0.1.0
