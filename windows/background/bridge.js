const RESULT_WIN = 'main';

function calculateTotalDPS(baseDamage, multishot, critChance, critMultiplier) {
  const damagePerShot = baseDamage * multishot;
  const critFactor = 1 + critChance * (critMultiplier - 1);
  return damagePerShot * critFactor;
}

function processLoadout({ weaponStats, mods }) {
  const baseDmgBonus = mods
    .filter((m) => m.type === 'BASE_DAMAGE')
    .reduce((s, m) => s + m.value, 0);
  const elementalBonus = mods
    .filter((m) => m.type === 'ELEMENTAL')
    .reduce((s, m) => s + m.value, 0);
  const multishotBonus = mods
    .filter((m) => m.type === 'MULTISHOT')
    .reduce((s, m) => s + m.value, 0);
  const critChanceBonus = mods
    .filter((m) => m.type === 'CRIT_CHANCE')
    .reduce((s, m) => s + m.value, 0);
  const critDmgBonus = mods
    .filter((m) => m.type === 'CRIT_DMG')
    .reduce((s, m) => s + m.value, 0);

  const modifiedBase = weaponStats.baseDamage * (1 + baseDmgBonus);
  const elementalDmg = modifiedBase * elementalBonus;
  const totalBase = modifiedBase + elementalDmg;
  const multishot = (weaponStats.baseMultishot || 1) + multishotBonus;
  const critChance = weaponStats.baseCritChance * (1 + critChanceBonus);
  const critMulti = weaponStats.baseCritMultiplier * (1 + critDmgBonus);

  return {
    dps: calculateTotalDPS(totalBase, multishot, critChance, critMulti),
    totalBase,
    multishot,
    critChance,
    critMultiplier: critMulti,
  };
}

overwolf.windows.onMessageReceived.addListener((event) => {
  if (event.id !== 'calculateDps') return;

  const { loadout } = event.data;
  const result = processLoadout({
    weaponStats: loadout.weaponStats,
    mods: loadout.mods,
  });

  overwolf.windows.sendMessage(RESULT_WIN, 'dpsUpdate', {
    dps: result.dps,
    totalBase: result.totalBase,
    multishot: result.multishot,
    critChance: result.critChance,
    critMultiplier: result.critMultiplier,
    weaponName: loadout.weaponName,
    loadout: loadout,
  });
});
