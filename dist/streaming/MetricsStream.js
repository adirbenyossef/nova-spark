"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsStream = void 0;
const events_1 = require("events");
/**
 * Streams and buffers metrics for efficient processing and transmission.
 *
 * MetricsStream extends EventEmitter to provide a streaming interface for
 * metric data, with configurable buffering and automatic flushing.
 *
 * @extends EventEmitter
 *
 * @example
 * ```typescript
 * const config = new Config({ metricsBufferSize: 1000 });
 * const stream = new MetricsStream(config);
 *
 * stream.on('data', (metrics) => {
 *   console.log('Processing metrics batch:', metrics);
 * });
 *
 * stream.push(newMetrics);
 * ```
 *
 * @fires MetricsStream#data
 */
class MetricsStream extends events_1.EventEmitter {
    /**
     * Creates a new MetricsStream instance.
     *
     * @param {Config} config - Configuration for the metrics stream
     */
    constructor(config) {
        super();
        this.config = config;
        this.buffer = [];
    }
    /**
     * Adds metrics to the buffer.
     *
     * Automatically flushes the buffer when it reaches the configured size.
     *
     * @param {Metric[]} metrics - Array of metrics to add to the buffer
     *
     * @example
     * ```typescript
     * stream.push([
     *   {
     *     name: 'memory.heapUsed',
     *     value: 1234567,
     *     timestamp: Date.now(),
     *     type: 'memory'
     *   }
     * ]);
     * ```
     */
    push(metrics) {
        this.buffer.push(...metrics);
        if (this.buffer.length >= this.config.metricsBufferSize) {
            this.flush();
        }
    }
    /**
     * Forces emission of currently buffered metrics.
     *
     * Emits a 'data' event with the current buffer contents and clears the buffer.
     *
     * @fires MetricsStream#data
     */
    flush() {
        if (this.buffer.length > 0) {
            /**
             * Data event.
             *
             * @event MetricsStream#data
             * @type {Metric[]}
             */
            this.emit('data', [...this.buffer]);
            this.buffer.length = 0;
        }
    }
    /**
     * Clears the metrics buffer without emitting.
     *
     * Useful for resetting the stream state without processing buffered metrics.
     */
    clear() {
        this.buffer.length = 0;
    }
}
exports.MetricsStream = MetricsStream;