import { findGame, games } from '../catalog';
describe('game destinations', () => {
  it('has three distinct details targets with truthful descriptions', () => {
    expect(new Set(games.map(game => game.id)).size).toBe(3);
    expect(findGame('maze')?.title).toBe('Maze Escape');
    expect(findGame('word-search')?.description).toMatch(/Hindi and English/);
  });
  it('rejects unknown game IDs', () => {
    expect(findGame('missing')).toBeUndefined();
  });
});
