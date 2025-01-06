"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CpuCollector = void 0;
/**
 * Collects CPU usage metrics from the Node.js process.
 *
 * The CpuCollector monitors both user and system CPU time,
 * providing insights into process performance and resource utilization.
 *
 * @implements {Collector}
 *
 * @example
 * ```typescript
 * const config = new Config({ cpuProfilingDuration: 500 });
 * const collector = new CpuCollector(config);
 *
 * await collector.start();
 * const metrics = await collector.collect();
 * await collector.stop();
 * ```
 */
class CpuCollector {
    /**
     * Creates a new CpuCollector instance.
     *
     * @param {Config} config - Configuration for the collector
     */
    constructor(config) {
        this.config = config;
        this.isRunning = false;
        this.lastUsage = null;
    }
    /**
     * Initializes the CPU collector.
     *
     * Sets up initial CPU usage baseline for delta calculations.
     *
     * @returns {Promise<void>} Resolves when initialization is complete
     */
    async start() {
        if (this.isRunning)
            return;
        this.lastUsage = process.cpuUsage();
        this.isRunning = true;
    }
    /**
     * Stops the CPU collector.
     *
     * Cleans up resources and resets the collector state.
     *
     * @returns {Promise<void>} Resolves when cleanup is complete
     */
    async stop() {
        if (!this.isRunning)
            return;
        this.lastUsage = null;
        this.isRunning = false;
    }
    /**
     * Collects CPU usage metrics.
     *
     * Gathers CPU usage data over the configured profiling duration.
     * Returns metrics for both user and system CPU time.
     *
     * @returns {Promise<Metric[]>} Array of CPU usage metrics
     * @throws {Error} If collection is attempted while collector is not running
     *
     * @example
     * Returned metrics format:
     * ```typescript
     * [
     *   {
     *     name: 'cpu.user',
     *     value: 123456,  // microseconds
     *     timestamp: 1234567890,
     *     type: 'cpu',
     *     metadata: { unit: 'microseconds' }
     *   },
     *   {
     *     name: 'cpu.system',
     *     value: 78901,   // microseconds
     *     timestamp: 1234567890,
     *     type: 'cpu',
     *     metadata: { unit: 'microseconds' }
     *   }
     * ]
     * ```
     */
    async collect() {
        if (!this.isRunning) {
            throw new Error('Collector must be started before collecting metrics');
        }
        const metrics = [];
        const startUsage = process.cpuUsage(this.lastUsage || undefined);
        // Wait for the configured duration
        await new Promise(resolve => setTimeout(resolve, this.config.cpuProfilingDuration));
        const endUsage = process.cpuUsage(startUsage);
        const timestamp = Date.now();
        // Store for next delta calculation
        this.lastUsage = process.cpuUsage();
        // Calculate CPU utilization percentage
        const totalTime = this.config.cpuProfilingDuration * 1000; // Convert to microseconds
        const userPercent = (endUsage.user / totalTime) * 100;
        const systemPercent = (endUsage.system / totalTime) * 100;
        metrics.push({
            name: 'cpu.user',
            value: userPercent,
            timestamp,
            type: 'cpu',
            metadata: {
                unit: 'percent',
                raw: endUsage.user,
                duration: this.config.cpuProfilingDuration
            }
        });
        metrics.push({
            name: 'cpu.system',
            value: systemPercent,
            timestamp,
            type: 'cpu',
            metadata: {
                unit: 'percent',
                raw: endUsage.system,
                duration: this.config.cpuProfilingDuration
            }
        });
        return metrics;
    }
}
exports.CpuCollector = CpuCollector;