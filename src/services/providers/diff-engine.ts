/**
 * DiffEngine
 *
 * Layer:
 *   Player Synchronisation — Change Detection
 *
 * Owns:
 *   Comparing two CanonicalPlayerModel instances
 *   Producing a ChangeSet describing only what changed
 *
 * Never owns:
 *   State mutations
 *   Provider lifecycle
 *
 * Input:
 *   CanonicalPlayerModel (incoming)
 *   CanonicalPlayerModel (current)
 *
 * Output:
 *   ChangeSet
 */

import type { CanonicalPlayerModel, ChangeSet, CollectionChanges, LoadoutChanges, ProfileChanges } from './types';

export class DiffEngine {
  diff(incoming: CanonicalPlayerModel, current: CanonicalPlayerModel | null): ChangeSet {
    const collectionChanges = this.diffCollections(incoming, current);
    const loadoutChanges = this.diffLoadout(incoming, current);
    const profileChanges = this.diffProfile(incoming, current);

    return {
      hasChanges: collectionChanges !== null || loadoutChanges !== null || profileChanges !== null,
      collectionsChanged: collectionChanges !== null,
      loadoutChanged: loadoutChanges !== null,
      profileChanged: profileChanges !== null,
      collectionChanges,
      loadoutChanges,
      profileChanges,
    };
  }

  private diffCollections(incoming: CanonicalPlayerModel, current: CanonicalPlayerModel | null): CollectionChanges | null {
    if (!current) {
      return {
        modsAdded: [...incoming.collections.modIds],
        modsRemoved: [],
        warframesAdded: [...incoming.collections.warframeIds],
        warframesRemoved: [],
        weaponsAdded: [...incoming.collections.weaponIds],
        weaponsRemoved: [],
        companionsAdded: [...incoming.collections.companionIds],
        companionsRemoved: [],
        arcanesAdded: [...incoming.collections.arcaneIds],
        arcanesRemoved: [],
      };
    }

    const modsAdded = [...incoming.collections.modIds].filter(id => !current.collections.modIds.has(id));
    const modsRemoved = [...current.collections.modIds].filter(id => !incoming.collections.modIds.has(id));
    const warframesAdded = [...incoming.collections.warframeIds].filter(id => !current.collections.warframeIds.has(id));
    const warframesRemoved = [...current.collections.warframeIds].filter(id => !incoming.collections.warframeIds.has(id));
    const weaponsAdded = [...incoming.collections.weaponIds].filter(id => !current.collections.weaponIds.has(id));
    const weaponsRemoved = [...current.collections.weaponIds].filter(id => !incoming.collections.weaponIds.has(id));
    const companionsAdded = [...incoming.collections.companionIds].filter(id => !current.collections.companionIds.has(id));
    const companionsRemoved = [...current.collections.companionIds].filter(id => !incoming.collections.companionIds.has(id));
    const arcanesAdded = [...incoming.collections.arcaneIds].filter(id => !current.collections.arcaneIds.has(id));
    const arcanesRemoved = [...current.collections.arcaneIds].filter(id => !incoming.collections.arcaneIds.has(id));

    const hasChanges = modsAdded.length > 0 || modsRemoved.length > 0 ||
      warframesAdded.length > 0 || warframesRemoved.length > 0 ||
      weaponsAdded.length > 0 || weaponsRemoved.length > 0 ||
      companionsAdded.length > 0 || companionsRemoved.length > 0 ||
      arcanesAdded.length > 0 || arcanesRemoved.length > 0;

    return hasChanges ? { modsAdded, modsRemoved, warframesAdded, warframesRemoved, weaponsAdded, weaponsRemoved, companionsAdded, companionsRemoved, arcanesAdded, arcanesRemoved } : null;
  }

  private diffLoadout(incoming: CanonicalPlayerModel, current: CanonicalPlayerModel | null): LoadoutChanges | null {
    if (!current || !incoming.currentLoadout) return incoming.currentLoadout ? { warframeChanged: true, weaponsChanged: [], companionChanged: false } : null;
    if (!current.currentLoadout) return { warframeChanged: true, weaponsChanged: Object.keys(incoming.currentLoadout.weapons), companionChanged: !!incoming.currentLoadout.companion };

    const warframeChanged = incoming.currentLoadout.warframe.id !== current.currentLoadout.warframe.id;
    const weaponsChanged = Object.keys(incoming.currentLoadout.weapons).filter(slot => {
      const inc = incoming.currentLoadout!.weapons[slot];
      const cur = current.currentLoadout!.weapons[slot];
      return !cur || inc.id !== cur.id;
    });
    const companionChanged = (incoming.currentLoadout.companion?.id ?? null) !== (current.currentLoadout.companion?.id ?? null);

    return (warframeChanged || weaponsChanged.length > 0 || companionChanged) ? { warframeChanged, weaponsChanged, companionChanged } : null;
  }

  private diffProfile(incoming: CanonicalPlayerModel, current: CanonicalPlayerModel | null): ProfileChanges | null {
    if (!current) return { playerNameChanged: !!incoming.profile.playerName, masteryRankChanged: incoming.profile.masteryRank > 0 };
    const playerNameChanged = incoming.profile.playerName !== current.profile.playerName;
    const masteryRankChanged = incoming.profile.masteryRank !== current.profile.masteryRank;
    return (playerNameChanged || masteryRankChanged) ? { playerNameChanged, masteryRankChanged } : null;
  }
}
