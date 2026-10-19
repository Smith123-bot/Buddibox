export const games = [
  { id: 'difference', title: 'Find the Difference', description: 'Spot the hidden differences between two pictures.', detail: 'Compare two pictures and find every carefully placed change.', mark: '01', accent: '#A69CFF' },
  { id: 'maze', title: 'Maze Escape', description: 'Find your way through challenging mazes.', detail: 'Navigate a maze from its start to its exit.', mark: '02', accent: '#43D9C3' },
  { id: 'word-search', title: 'Word Search', description: 'Find hidden words in Hindi and English.', detail: 'Search for words across a grid in English and Hindi.', mark: '03', accent: '#FFCA70' },
] as const;
export type GameId = (typeof games)[number]['id'];
export function findGame(id: string) { return games.find(game => game.id === id); }
