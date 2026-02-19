# Architecture

`vanilla-tables` keeps core concerns separated for predictable behavior and easier extension.

## Core Modules

- `src/core/state-store.js` (`StateStore`): Handles state mutations and row projection.
- `src/core/renderer.js` (`Renderer`): Coordinates DOM renderer parts only.
- `src/core/vanilla-table.js` (`VanillaTable`): Orchestrates lifecycle, events, plugins, and public API.

## Data Flow

1. `VanillaTable` receives rows + options and initializes `StateStore`, `Renderer`, and data source.
2. User actions/events mutate store state through explicit methods.
3. `refresh()` requests a projected view from the active data source.
4. `Renderer` writes the current header/body/footer DOM from that view.
5. Lifecycle and state events are emitted for integrations/plugins.

## Data Sources

- Client mode: `src/core/data-sources/client-data-source.js`
- Server mode: `src/core/data-sources/server-data-source.js`
- Resolver: `src/core/data-sources/create-data-source.js`

## Parallel Projection

- Worker pool: `src/core/parallel/projection-worker-pool.js`
- Enabled through `options.parallel`
- Falls back to sync path if workers are unavailable or fail

## Extension Points

- Plugins: `table.use(plugin)`
- Hooks: `table.registerHook(name, callback)`
- Theme plugins: `src/plugins/*`
- Server adapters: `src/adapters/server-adapters.js`
