/**
 * MediaSoup Worker Manager
 * 
 * Manages MediaSoup workers (separate processes that handle media routing).
 * Uses round-robin to distribute load across workers.
 */

import * as mediasoup from 'mediasoup'
import type { Worker, WebRtcServer } from 'mediasoup/node/lib/types'
import { workerSettings, numWorkers, webRtcServerOptions } from './config'

class WorkerManager {
  private workers: Worker[] = []
  private webRtcServers: WebRtcServer[] = []
  private nextWorkerIndex = 0
  private initialized = false

  /**
   * Initialize MediaSoup workers
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('[MediaSoup] Workers already initialized')
      return
    }

    console.log(`[MediaSoup] Creating ${numWorkers} workers...`)

    for (let i = 0; i < numWorkers; i++) {
      const worker = await this.createWorker(i)
      this.workers.push(worker)
    }

    this.initialized = true
    console.log(`[MediaSoup] ${this.workers.length} workers created`)
  }

  /**
   * Create a single MediaSoup worker
   */
  private async createWorker(index: number): Promise<Worker> {
    const worker = await mediasoup.createWorker(workerSettings)

    worker.on('died', (error) => {
      console.error(`[MediaSoup] Worker ${index} died:`, error)
      
      // Remove the dead worker
      const workerIndex = this.workers.indexOf(worker)
      if (workerIndex !== -1) {
        this.workers.splice(workerIndex, 1)
      }
      
      // Restart worker after a delay
      setTimeout(async () => {
        console.log(`[MediaSoup] Restarting worker ${index}...`)
        try {
          const newWorker = await this.createWorker(index)
          this.workers.push(newWorker)
          console.log(`[MediaSoup] Worker ${index} restarted`)
        } catch (err) {
          console.error(`[MediaSoup] Failed to restart worker ${index}:`, err)
        }
      }, 2000)
    })

    // Create WebRTC server for this worker (optional, for port sharing)
    try {
      const webRtcServer = await worker.createWebRtcServer({
        ...webRtcServerOptions,
        listenInfos: webRtcServerOptions.listenInfos.map((info) => ({
          ...info,
          port: info.port + index, // Each worker gets its own port
        })),
      })
      this.webRtcServers.push(webRtcServer)
      console.log(`[MediaSoup] Worker ${index} WebRTC server created on port ${webRtcServerOptions.listenInfos[0].port + index}`)
    } catch (err) {
      // WebRTC server is optional, continue without it
      console.log(`[MediaSoup] Worker ${index} created without WebRTC server (will use individual transports)`)
    }

    console.log(`[MediaSoup] Worker ${index} created, PID: ${worker.pid}`)
    return worker
  }

  /**
   * Get the next available worker (round-robin)
   */
  getNextWorker(): Worker {
    if (this.workers.length === 0) {
      throw new Error('[MediaSoup] No workers available')
    }

    const worker = this.workers[this.nextWorkerIndex]
    this.nextWorkerIndex = (this.nextWorkerIndex + 1) % this.workers.length
    return worker
  }

  /**
   * Get worker by index
   */
  getWorker(index: number): Worker | undefined {
    return this.workers[index]
  }

  /**
   * Get all workers
   */
  getAllWorkers(): Worker[] {
    return [...this.workers]
  }

  /**
   * Get WebRTC server for a worker (if available)
   */
  getWebRtcServer(workerIndex: number): WebRtcServer | undefined {
    return this.webRtcServers[workerIndex]
  }

  /**
   * Close all workers
   */
  async close(): Promise<void> {
    console.log('[MediaSoup] Closing all workers...')
    
    for (const worker of this.workers) {
      worker.close()
    }
    
    this.workers = []
    this.webRtcServers = []
    this.initialized = false
    
    console.log('[MediaSoup] All workers closed')
  }

  /**
   * Get worker statistics
   */
  async getStats(): Promise<{
    workersCount: number
    resourceUsage: Array<{
      pid: number
      memory: number
    }>
  }> {
    const resourceUsage = await Promise.all(
      this.workers.map(async (worker) => ({
        pid: worker.pid,
        memory: (await worker.getResourceUsage()).ru_maxrss,
      }))
    )

    return {
      workersCount: this.workers.length,
      resourceUsage,
    }
  }
}

// Singleton instance
export const workerManager = new WorkerManager()
