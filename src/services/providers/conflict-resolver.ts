/**
 * ConflictResolver
 *
 * Layer:
 *   Player Synchronisation — Conflict Resolution
 *
 * Owns:
 *   Merge strategies, confirmation dialogs, store application
 *
 * Never owns:
 *   Provider lifecycle
 *   Normalization
 *
 * Input:
 *   ChangeSet
 *   CanonicalPlayerModel (incoming)
 *   function to check for unsaved changes
 *
 * Output:
 *   Resolved changes applied to libraryStore
 */

import type { CanonicalPlayerModel, ChangeSet } from './types';
import { useLibraryStore } from '../../store/libraryStore';

export type ConflictStrategy = 'auto-merge' | 'confirm' | 'skip';

export class ConflictResolver {
  private strategy: ConflictStrategy;

  constructor(strategy: ConflictStrategy = 'auto-merge') {
    this.strategy = strategy;
  }

  setStrategy(strategy: ConflictStrategy): void {
    this.strategy = strategy;
  }

  async resolve(
    incoming: CanonicalPlayerModel,
    changeSet: ChangeSet,
    hasUnsavedChanges: () => boolean,
    onConfirm?: (changeSet: ChangeSet) => Promise<boolean>,
  ): Promise<boolean> {
    if (!changeSet.hasChanges) return false;

    // If there are unsaved changes and we're not auto-merging, ask for confirmation
    if (hasUnsavedChanges() && this.strategy !== 'auto-merge') {
      if (onConfirm) {
        const confirmed = await onConfirm(changeSet);
        if (!confirmed) return false;
      }
    }

    // Apply collection changes
    if (changeSet.collectionChanges) {
      this.applyCollectionChanges(incoming);
    }

    return true;
  }

  private applyCollectionChanges(incoming: CanonicalPlayerModel): void {
    const store = useLibraryStore.getState();

    const mergeSet = (existing: Set<string> | null, added: string[], removed: string[]): Set<string> | null => {
      const result = new Set(existing ?? []);
      for (const id of added) result.add(id);
      for (const id of removed) result.delete(id);
      return result.size > 0 ? result : null;
    };

    store.setOwnedModIds(mergeSet(store.ownedModIds, [...incoming.collections.modIds], []));
    store.setOwnedWarframeIds(mergeSet(store.ownedWarframeIds, [...incoming.collections.warframeIds], []));
    store.setOwnedWeaponIds(mergeSet(store.ownedWeaponIds, [...incoming.collections.weaponIds], []));
    store.setOwnedCompanionIds(mergeSet(store.ownedCompanionIds, [...incoming.collections.companionIds], []));
    store.setOwnedArcaneIds(mergeSet(store.ownedArcaneIds, [...incoming.collections.arcaneIds], []));
  }
}
