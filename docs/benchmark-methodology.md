# Benchmark Methodology

## Purpose

Provides reproducible baseline numbers for render, refresh-hit, search, and sort operations.

## Commands

```bash
npm run bench
npm run bench:memory
```

## Stress Benchmark Notes

- Script: `benchmarks/table-benchmark.mjs`
- Default thresholds: render <= 100ms, refresh-hit <= 100ms, search <= 100ms, sort <= 100ms
- Default sampling: warmup-runs=1, repeat-runs=1 (median)
- Default endpoint: `http://127.0.0.1:4173`

## Memory Benchmark Notes

- Script: `benchmarks/memory-cycle-benchmark.mjs`
- Reports heap usage across repeated mount/update/destroy cycles

## Repro Guidance

- Run on an idle machine when possible.
- Close other heavy browser tabs/processes.
- Capture environment metadata when posting results:
  - OS and version
  - CPU model
  - Node version
  - Browser (for e2e perf scenarios)

