/**
 * ProviderManager
 *
 * Layer:
 *   Player Synchronisation — Provider Lifecycle
 *
 * Owns:
 *   Provider registration, capability discovery, health monitoring
 *
 * Never owns:
 *   Normalization, diffing, conflict resolution
 *   Store mutations
 *   Engine access
 *
 * Input:
 *   IProvider implementations (registered externally)
 *
 * Output:
 *   Provider capabilities, status, health for UI consumption
 */

import type { IProvider, CapabilityManifest, ProviderStatus } from './types';

export class ProviderManager {
  private providers: Map<string, IProvider> = new Map();
  private healthInterval: ReturnType<typeof setInterval> | null = null;
  private healthListeners: Array<(id: string, status: ProviderStatus) => void> = [];

  register(provider: IProvider): void {
    if (this.providers.has(provider.id)) {
      console.warn(`[ProviderManager] Provider '${provider.id}' already registered. Skipping.`); // eslint-disable-line no-console
      return;
    }
    this.providers.set(provider.id, provider);
    console.log(`[ProviderManager] Registered: ${provider.displayName} (priority: ${provider.priority})`); // eslint-disable-line no-console
  }

  unregister(id: string): void {
    const provider = this.providers.get(id);
    if (provider) {
      provider.destroy();
      this.providers.delete(id);
    }
  }

  getProvider(id: string): IProvider | undefined {
    return this.providers.get(id);
  }

  getAllProviders(): IProvider[] {
    return [...this.providers.values()].sort((a, b) => b.priority - a.priority);
  }

  getCapabilities(): Map<string, CapabilityManifest> {
    const result = new Map<string, CapabilityManifest>();
    for (const [id, provider] of this.providers) {
      result.set(id, provider.getCapabilities());
    }
    return result;
  }

  getStatuses(): Map<string, ProviderStatus> {
    const result = new Map<string, ProviderStatus>();
    for (const [id, provider] of this.providers) {
      result.set(id, provider.getStatus());
    }
    return result;
  }

  onHealthChange(listener: (id: string, status: ProviderStatus) => void): () => void {
    this.healthListeners.push(listener);
    return () => {
      this.healthListeners = this.healthListeners.filter(l => l !== listener);
    };
  }

  getAllSnapshots(): Promise<Array<{ providerId: string; snapshot: Awaited<ReturnType<IProvider['getSnapshot']>> }>> {
    return Promise.all(
      this.getAllProviders().map(async p => ({
        providerId: p.id,
        snapshot: await p.getSnapshot(),
      })),
    );
  }

  startHealthMonitoring(intervalMs = 60000): void {
    if (this.healthInterval) return;
    this.healthInterval = setInterval(() => {
      for (const [id, provider] of this.providers) {
        const status = provider.getStatus();
        this.healthListeners.forEach(l => l(id, status));
      }
    }, intervalMs);
  }

  stopHealthMonitoring(): void {
    if (this.healthInterval) {
      clearInterval(this.healthInterval);
      this.healthInterval = null;
    }
  }

  destroy(): void {
    this.stopHealthMonitoring();
    for (const [, provider] of this.providers) {
      provider.destroy();
    }
    this.providers.clear();
    this.healthListeners = [];
  }
}
