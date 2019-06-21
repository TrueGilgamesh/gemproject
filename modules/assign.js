module.exports = function(elves, stash, c1, c2, c3) {
  if (
    !Array.isArray(elves) ||
    !Array.isArray(stash) ||
    elves.length === 0 ||
    stash.length === 0 ||
    typeof c1 !== 'number' ||
    typeof c2 !== 'number' ||
    typeof c3 !== 'number'
  ) {
    throw new Error('Неправильные параметры');
  }

  const assignedGems = [];

  const elvesCopy = elves.map(elf =>
    Object.assign({}, elf, { hasReceived: false })
  );

  const stashCopy = stash.slice();

  let maxGems = elvesCopy.reduce((max, elf) => Math.max(max, elf.gems), 0);

  const gemTypes = stash
    .map(gem => gem.type)
    .filter((type, index, array) => array.indexOf(type) === index);

  const getPriority = (gemType, elf) => {
    const priority1 =
      c1 > 0 ? c1 * (maxGems === 0 ? 1 : (maxGems - elf.gems) / maxGems) : 0;
    const priority2 = c2 > 0 && !elf.hasReceived ? c2 : 0;
    const pref = (elf.favorites && elf.favorites[gemType]) || 0;
    const priority3 = c3 > 0 && pref > 0 ? c3 * pref : 0;
    return priority1 + priority2 + priority3;
  };

  while (gemTypes.length > 0) {
    let next = null;
    let maxPriority = -1;

    gemTypes.forEach(gemType => {
      elvesCopy.forEach(elf => {
        const priority = getPriority(gemType, elf);

        if (priority > maxPriority) {
          maxPriority = priority;
          next = { gemType, elf };
        }
      });
    });

    const gemsOfType = stashCopy.filter(gem => gem.type === next.gemType);
    const gemToAssign = gemsOfType[0];

    assignedGems.push({ gem: gemToAssign, elf: next.elf });

    stashCopy.splice(stashCopy.indexOf(gemToAssign), 1);

    if (gemsOfType.length === 1) {
      gemTypes.splice(gemTypes.indexOf(next.gemType), 1);
    }

    next.elf.hasReceived = true;
    next.elf.gems += 1;

    if (next.elf.gems > maxGems) {
      maxGems = next.elf.gems;
    }
  }

  return assignedGems;
};
