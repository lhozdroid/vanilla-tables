# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

- Added performance pipeline enhancements:
- Virtual column windowing and spacer rendering support.
- Adaptive overscan and scheduled refresh behavior.
- Incremental filter/search narrowing and cached sort comparator paths.
- Worker projection typed column caches and fallback safety improvements.
- Added unit and e2e coverage for virtual layout and HTML safety flows.
- Updated stress benchmark timing to exclude fixture generation from `render_ms`.
- Updated docs with performance architecture and benchmark methodology clarifications.

## [0.1.0] - 2026-02-18

- First public npm release.
- Core data-table engine with search, filtering, sorting, paging.
- Theme plugins for vanilla, Bootstrap, Bulma, MUI-like, and Tailwind.
- Fixed regions, expandable rows, editable rows, row actions.
- Worker-assisted projection with fallback behavior.
- Unit, e2e, stress, and memory benchmark coverage.
