/**
 * Executes filter/search/sort projections across worker shards.
 */
export class ProjectionWorkerPool {
    /**
     * Creates a worker pool instance.
     *
     * @param {{ size: number, timeoutMs?: number, retries?: number }} config
     */
    constructor({ size, timeoutMs, retries }) {
        /** @type {number} */
        this.size = Math.max(1, Number(size || 1));
        /** @type {{ worker: Worker }[]} */
        this.workers = [];
        /** @type {Map<number, { resolve: (value: any) => void, reject: (reason: any) => void }>} */
        this.pending = new Map();
        /** @type {number} */
        this.nextId = 1;
        /** @type {number} */
        this.timeoutMs = Math.max(50, Number(timeoutMs || 4000));
        /** @type {number} */
        this.retries = Math.max(0, Math.floor(Number(retries || 1)));
        /** @type {Record<string, any>[]} */
        this.rows = [];

        for (let i = 0; i < this.size; i += 1) {
            this.workers.push({ worker: this.createWorker() });
        }
    }

    /**
     * Terminates all worker instances.
     *
     * @returns {void}
     */
    destroy() {
        for (const slot of this.workers) {
            slot.worker.terminate();
        }
        this.workers = [];
        this.pending.clear();
    }

    /**
     * Distributes rows across workers.
     *
     * @param {Record<string, any>[]} rows
     * @returns {Promise<void>}
     */
    setRows(rows) {
        const data = Array.isArray(rows) ? rows : [];
        this.rows = data;
        const shardSize = Math.ceil((data.length || 1) / this.workers.length);

        return Promise.all(
            this.workers.map((slot, index) => {
                const start = index * shardSize;
                const end = Math.min(start + shardSize, data.length);
                return this.runTask(slot.worker, {
                    type: 'setRows',
                    rows: data.slice(start, end),
                    offset: start
                }).then(() => {});
            })
        ).then(() => {});
    }

    /**
     * Computes filtered/sorted row indices using worker shards.
     *
     * @param {{ keys: string[], searchTerm: string, columnFilters: Record<string, string>, sorts: { key: string, direction: 'asc'|'desc' }[] }} query
     * @returns {Promise<number[]>}
     */
    project(query) {
        return Promise.all(
            this.workers.map((slot) =>
                this.runTask(slot.worker, {
                    type: 'project',
                    keys: query.keys,
                    searchTerm: query.searchTerm,
                    columnFilters: query.columnFilters,
                    sorts: query.sorts
                })
            )
        ).then((chunks) => this.mergeChunks(chunks, query.sorts));
    }

    /**
     * Creates one worker with inline projection logic.
     *
     * @returns {Worker}
     */
    createWorker() {
        const worker = new Worker(getWorkerUrl());
        worker.onmessage = (event) => {
            const payload = event.data || {};
            const pending = this.pending.get(payload.id);
            if (!pending) return;

            this.pending.delete(payload.id);
            if (payload.error) {
                pending.reject(new Error(payload.error));
                return;
            }
            pending.resolve(payload.result);
        };
        worker.onerror = () => {
            this.pending.forEach(({ reject }) => reject(new Error('projection worker failed')));
            this.pending.clear();
        };
        return worker;
    }

    /**
     * Runs one task on a worker and resolves by task id.
     *
     * @param {Worker} worker
     * @param {Record<string, any>} payload
     * @returns {Promise<any>}
     */
    runTask(worker, payload) {
        return this.runTaskAttempt(worker, payload, this.retries);
    }

    /**
     * Runs one task with retry and timeout guards.
     *
     * @param {Worker} worker
     * @param {Record<string, any>} payload
     * @param {number} retriesLeft
     * @returns {Promise<any>}
     */
    runTaskAttempt(worker, payload, retriesLeft) {
        const id = this.nextId;
        this.nextId += 1;
        let timeoutHandle;

        return new Promise((resolve, reject) => {
            const onReject = (error) => {
                clearTimeout(timeoutHandle);
                if (retriesLeft > 0) {
                    this.runTaskAttempt(worker, payload, retriesLeft - 1)
                        .then(resolve)
                        .catch(reject);
                    return;
                }
                reject(error);
            };

            const onResolve = (result) => {
                clearTimeout(timeoutHandle);
                resolve(result);
            };

            this.pending.set(id, { resolve: onResolve, reject: onReject });
            timeoutHandle = setTimeout(() => {
                this.pending.delete(id);
                onReject(new Error(`projection worker timeout after ${this.timeoutMs}ms`));
            }, this.timeoutMs);
            worker.postMessage({
                ...payload,
                id
            });
        });
    }

    /**
     * Merges per-shard result chunks into one globally ordered index array.
     *
     * @param {number[][]} chunks
     * @param {{ key: string, direction: 'asc'|'desc' }[]} sorts
     * @returns {number[]}
     */
    mergeChunks(chunks, sorts) {
        if (!Array.isArray(chunks) || !chunks.length) return [];
        if (!Array.isArray(sorts) || !sorts.length) return chunks.flat();

        const pointers = new Int32Array(chunks.length);
        const output = [];

        while (true) {
            let bestChunk = -1;
            let bestIndex = -1;

            for (let i = 0; i < chunks.length; i += 1) {
                const pointer = pointers[i];
                const chunk = chunks[i];
                if (pointer >= chunk.length) continue;

                const currentIndex = chunk[pointer];
                if (bestChunk === -1) {
                    bestChunk = i;
                    bestIndex = currentIndex;
                    continue;
                }

                const comparison = compareRowsBySorts(this.rows[currentIndex], this.rows[bestIndex], sorts);
                if (comparison < 0 || (comparison === 0 && currentIndex < bestIndex)) {
                    bestChunk = i;
                    bestIndex = currentIndex;
                }
            }

            if (bestChunk === -1) break;
            output.push(bestIndex);
            pointers[bestChunk] += 1;
        }

        return output;
    }
}

/** @type {string | null} */
let cachedWorkerUrl = null;

/**
 * Returns a blob URL for the projection worker implementation.
 *
 * @returns {string}
 */
function getWorkerUrl() {
    if (cachedWorkerUrl) return cachedWorkerUrl;

    const source = `
    const toText = (value) => String(value ?? '').toLowerCase();

    let rows = [];
    let offset = 0;
    let textColumns = new Map();
    let numericColumns = new Map();

    const getTextColumn = (key) => {
      if (textColumns.has(key)) return textColumns.get(key);
      const values = new Array(rows.length);
      for (let i = 0; i < rows.length; i += 1) {
        values[i] = toText(rows[i] && rows[i][key]);
      }
      textColumns.set(key, values);
      return values;
    };

    const getNumericColumn = (key) => {
      if (numericColumns.has(key)) return numericColumns.get(key);
      const values = new Float64Array(rows.length);
      const flags = new Uint8Array(rows.length);
      for (let i = 0; i < rows.length; i += 1) {
        const parsed = Number(rows[i] && rows[i][key]);
        if (Number.isFinite(parsed)) {
          values[i] = parsed;
          flags[i] = 1;
        }
      }
      const output = { values, flags };
      numericColumns.set(key, output);
      return output;
    };

    self.onmessage = (event) => {
      const data = event.data || {};

      try {
        if (data.type === 'setRows') {
          rows = Array.isArray(data.rows) ? data.rows : [];
          offset = Number(data.offset || 0);
          textColumns = new Map();
          numericColumns = new Map();
          self.postMessage({ id: data.id, result: true });
          return;
        }

        if (data.type === 'project') {
          const keys = Array.isArray(data.keys) ? data.keys : [];
          const searchTerm = toText(data.searchTerm || '');
          const sorts = Array.isArray(data.sorts) ? data.sorts : [];
          const filters = data.columnFilters && typeof data.columnFilters === 'object'
            ? data.columnFilters
            : {};
          const filterEntries = Object.entries(filters);
          const output = [];
          const textByKey = new Map();
          const numericByKey = new Map();
          const getText = (key) => {
            if (textByKey.has(key)) return textByKey.get(key);
            const values = getTextColumn(key);
            textByKey.set(key, values);
            return values;
          };
          const getNumeric = (key) => {
            if (numericByKey.has(key)) return numericByKey.get(key);
            const values = getNumericColumn(key);
            numericByKey.set(key, values);
            return values;
          };

          for (let i = 0; i < rows.length; i += 1) {
            let matchesFilters = true;

            for (const [key, term] of filterEntries) {
              if (!getText(key)[i].includes(toText(term))) {
                matchesFilters = false;
                break;
              }
            }
            if (!matchesFilters) continue;

            if (!searchTerm) {
              output.push(offset + i);
              continue;
            }

            let matchesSearch = false;
            for (const key of keys) {
              if (getText(key)[i].includes(searchTerm)) {
                matchesSearch = true;
                break;
              }
            }
            if (matchesSearch) output.push(offset + i);
          }

          if (sorts.length > 0) {
            output.sort((leftIndex, rightIndex) => {
              const leftRowIndex = leftIndex - offset;
              const rightRowIndex = rightIndex - offset;
              for (const sort of sorts) {
                const numeric = getNumeric(sort.key);
                const text = getText(sort.key);
                let cmp = 0;
                const bothNumeric = numeric.flags[leftRowIndex] && numeric.flags[rightRowIndex];
                if (bothNumeric) {
                  cmp = numeric.values[leftRowIndex] - numeric.values[rightRowIndex];
                } else {
                  const leftText = text[leftRowIndex];
                  const rightText = text[rightRowIndex];
                  if (leftText < rightText) cmp = -1;
                  else if (leftText > rightText) cmp = 1;
                }

                if (cmp !== 0) return sort.direction === 'desc' ? -cmp : cmp;
              }
              return leftIndex - rightIndex;
            });
          }

          self.postMessage({ id: data.id, result: output });
          return;
        }

        self.postMessage({ id: data.id, result: null });
      } catch (error) {
        self.postMessage({ id: data.id, error: error && error.message ? error.message : 'worker error' });
      }
    };
  `;

    cachedWorkerUrl = URL.createObjectURL(new Blob([source], { type: 'application/javascript' }));
    return cachedWorkerUrl;
}

/**
 * Compares two rows by sort definitions.
 *
 * @param {Record<string, any>} leftRow
 * @param {Record<string, any>} rightRow
 * @param {{ key: string, direction: 'asc'|'desc' }[]} sorts
 * @returns {number}
 */
function compareRowsBySorts(leftRow, rightRow, sorts) {
    for (const sort of sorts) {
        const leftRaw = leftRow?.[sort.key];
        const rightRaw = rightRow?.[sort.key];
        const leftNum = Number(leftRaw);
        const rightNum = Number(rightRaw);
        const leftFinite = Number.isFinite(leftNum);
        const rightFinite = Number.isFinite(rightNum);

        let comparison = 0;
        if (leftFinite && rightFinite) {
            comparison = leftNum - rightNum;
        } else {
            const leftText = String(leftRaw ?? '').toLowerCase();
            const rightText = String(rightRaw ?? '').toLowerCase();
            if (leftText < rightText) comparison = -1;
            else if (leftText > rightText) comparison = 1;
        }

        if (comparison !== 0) {
            return sort.direction === 'desc' ? -comparison : comparison;
        }
    }

    return 0;
}
