const assign = require('../modules/assign');

describe('Функция распределения', () => {
  it('должна вернуть массив', () => {
    const assigned = assign(
      [{ id: 'Elf 1', gems: 0 }],
      createStash({ 'Gem 1': 1 }),
      0,
      0,
      0
    );
    expect(assigned instanceof Array).toBe(true);
  });

  describe('должна распределить драгоценности', () => {
    it('равномерно', () => {
      const assigned = assign(
        [
          { id: 'Elf 1', gems: 1 },
          { id: 'Elf 2', gems: 10 },
          { id: 'Elf 3', gems: 5 }
        ],
        createStash({ 'Gem 1': 3, 'Gem 2': 7, 'Gem 3': 4 }),
        1,
        0,
        0
      );

      expect(countGems(assigned, 'Elf 1')).toBe(9);
      expect(countGems(assigned, 'Elf 2')).toBe(0);
      expect(countGems(assigned, 'Elf 3')).toBe(5);
    });

    it('как минимум по одной', () => {
      const assigned = assign(
        [
          { id: 'Elf 1', gems: 1 },
          { id: 'Elf 2', gems: 10 },
          { id: 'Elf 3', gems: 5 }
        ],
        createStash({ 'Gem 1': 1, 'Gem 2': 1, 'Gem 3': 1 }),
        0,
        1,
        0
      );

      expect(countGems(assigned, 'Elf 1')).toBeGreaterThanOrEqual(1);
      expect(countGems(assigned, 'Elf 2')).toBeGreaterThanOrEqual(1);
      expect(countGems(assigned, 'Elf 3')).toBeGreaterThanOrEqual(1);
    });

    it('как минимум по одной, затем равномерно', () => {
      const assigned = assign(
        [
          { id: 'Elf 1', gems: 19 },
          { id: 'Elf 2', gems: 7 },
          { id: 'Elf 3', gems: 0 }
        ],
        createStash({ 'Gem 1': 5, 'Gem 2': 5, 'Gem 3': 4 }),
        0.5,
        0.5,
        0
      );

      expect(countGems(assigned, 'Elf 1')).toBe(1);
      expect(countGems(assigned, 'Elf 2')).toBe(3);
      expect(countGems(assigned, 'Elf 3')).toBe(10);
    });

    it('в соответствии с предпочтениями', () => {
      const assigned = assign(
        [
          { id: 'Elf 1', gems: 20, favorites: { 'Gem 1': 1 } },
          { id: 'Elf 2', gems: 50, favorites: { 'Gem 2': 1 } },
          { id: 'Elf 3', gems: 10, favorites: { 'Gem 3': 1 } }
        ],
        createStash({ 'Gem 1': 5, 'Gem 2': 5, 'Gem 3': 4 }),
        0,
        0,
        1
      );

      expect(countGems(assigned, 'Elf 1', 'Gem 1')).toBe(5);
      expect(countGems(assigned, 'Elf 2', 'Gem 2')).toBe(5);
      expect(countGems(assigned, 'Elf 3', 'Gem 3')).toBe(4);
    });
  });

  it('по одному в соответствии с предпочтениями, затем равномерно', () => {
    const assigned = assign(
      [
        { id: 'Elf 1', gems: 1, favorites: {} },
        { id: 'Elf 2', gems: 4, favorites: {} },
        { id: 'Elf 3', gems: 30, favorites: { 'Gem 3': 1 } },
        { id: 'Elf 4', gems: 40, favorites: { 'Gem 4': 1 } },
        { id: 'Elf 5', gems: 50, favorites: { 'Gem 5': 1 } }
      ],
      createStash({
        'Gem 1': 2,
        'Gem 2': 3,
        'Gem 3': 1,
        'Gem 4': 1,
        'Gem 5': 1
      }),
      0.5,
      0.25,
      0.25
    );

    expect(countGems(assigned, 'Elf 1')).toBe(4);
    expect(countGems(assigned, 'Elf 2')).toBe(1);
    expect(countGems(assigned, 'Elf 3', 'Gem 3')).toBe(1);
    expect(countGems(assigned, 'Elf 4', 'Gem 4')).toBe(1);
    expect(countGems(assigned, 'Elf 5', 'Gem 5')).toBe(1);
  });

  it('когда у всех нет драгоценностей', () => {
    const assigned = assign(
      [
        { id: 'Elf 1', gems: 0 },
        { id: 'Elf 2', gems: 0 },
        { id: 'Elf 3', gems: 0, favorites: { 'Gem 3': 1 } }
      ],
      createStash({
        'Gem 1': 3,
        'Gem 2': 3,
        'Gem 3': 3
      }),
      0.5,
      0.25,
      0.25
    );

    expect(countGems(assigned, 'Elf 1')).toBe(3);
    expect(countGems(assigned, 'Elf 2')).toBe(3);
    expect(countGems(assigned, 'Elf 3', 'Gem 3')).toBe(3);
  });
});

function createStash(gems) {
  let stash = [];

  Object.keys(gems).forEach(gemType => {
    for (let i = 1; i <= gems[gemType]; i++) {
      stash.push({ id: parseInt(i), type: gemType });
    }
  });

  return stash;
}

function countGems(assigned, elf, gemType) {
  return assigned.filter(
    assignment =>
      assignment.elf.id === elf &&
      (gemType === undefined || assignment.gem.type === gemType)
  ).length;
}
