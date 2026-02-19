# Development

## Local Setup

```bash
npm install
```

## Build And Test

```bash
npm run build
npm test
```

Optional:

```bash
npm run test:e2e
npm run test:e2e:perf
npm run bench
npm run bench:memory
```

## Release Verification

Before publish:

```bash
npm run build
npm run test
npm run test:e2e:perf
npm run release:verify
```

## Contribution Workflow

1. Pick an issue (start at `#14`): https://github.com/lhozdroid/vanilla-tables/issues/14
2. Create a branch from `main`.
3. Implement focused changes with tests/docs as needed.
4. Run build + tests locally.
5. Open a PR and include `Fixes #<issue-number>` when applicable.

## Project Boundaries

- Keep core framework-independent and dependency-light.
- Add behavior through options, hooks, or plugins.
- Preserve public API compatibility unless planning a major version change.

