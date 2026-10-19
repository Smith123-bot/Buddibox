import type { ImageSourcePropType } from 'react-native';
export type Region = { id: string; x: number; y: number; rx: number; ry: number; label: string };
export type Level = {
  id: string; number: number; title: string; difficulty: string;
  images: readonly [ImageSourcePropType, ImageSourcePropType];
  regions: readonly Region[]; expected: 5; hintLimit: number; parSeconds: number;
  review: 'pixel-verified';
  decoys: readonly { label: string; x: number; y: number }[];
};
const region = (id: string, label: string, x: number, y: number, rx: number, ry: number): Region => ({ id, label, x: x / 900, y: y / 600, rx: rx / 900, ry: ry / 600 });
export const levels: readonly Level[] = [
  { id: 'garden-001', number: 1, title: 'Garden cottage', difficulty: 'Easy', images: [require('../../../assets/games/find-the-difference/garden/a.png'), require('../../../assets/games/find-the-difference/garden/b.png')], expected: 5, hintLimit: 2, parSeconds: 100, review: 'pixel-verified',
    regions: [region('sun','sun symbol',140,105,48,48),region('cloud','small cloud',750,105,48,48),region('flower','floating flower',260,390,53,50),region('frame','garden frame',674,408,55,55),region('roof','roof ornament',450,268,44,49)],
    decoys: [{ label: 'front door', x: 0.55, y: 0.69 }, { label: 'window', x: 0.42, y: 0.58 }, { label: 'left garden flower', x: 0.09, y: 0.76 }] },
  { id: 'harbor-002', number: 2, title: 'Quiet harbor', difficulty: 'Medium', images: [require('../../../assets/games/find-the-difference/harbor/a.png'), require('../../../assets/games/find-the-difference/harbor/b.png')], expected: 5, hintLimit: 2, parSeconds: 120, review: 'pixel-verified',
    regions: [region('sun','sun center',152,117,52,52),region('cloud','distant cloud',730,130,50,49),region('sail','boat sail',389,299,59,67),region('shell','beach shell',780,453,51,52),region('badge','water token',164,444,50,53)],
    decoys: [{ label: 'boat hull', x: 0.44, y: 0.66 }, { label: 'umbrella pole', x: 0.78, y: 0.68 }, { label: 'sea wave', x: 0.54, y: 0.79 }] },
  { id: 'market-003', number: 3, title: 'Night market', difficulty: 'Medium', images: [require('../../../assets/games/find-the-difference/night-market/a.png'), require('../../../assets/games/find-the-difference/night-market/b.png')], expected: 5, hintLimit: 2, parSeconds: 140, review: 'pixel-verified',
    regions: [region('moon','moon center',130,112,52,53),region('tower','sky sign',750,112,49,50),region('awning','left stall ornament',274,305,55,52),region('lantern','right stall lantern',642,297,48,54),region('car','car door badge',453,476,50,49)],
    decoys: [{ label: 'left stall wall', x: 0.30, y: 0.72 }, { label: 'car wheel', x: 0.45, y: 0.88 }, { label: 'right stall roof', x: 0.70, y: 0.59 }] },
];
export function getLevel(id: string) { return levels.find(level => level.id === id); }
export function validateLevel(level: Level): string[] {
  const errors: string[] = [];
  if (!level.id || level.expected !== 5 || level.regions.length !== 5 || level.hintLimit < 0 || level.parSeconds <= 0 || level.review !== 'pixel-verified' || level.images.length !== 2) errors.push('invalid metadata');
  if (new Set(level.regions.map(r => r.id)).size !== level.regions.length) errors.push('duplicate region');
  for (const r of level.regions) {
    if (![r.x,r.y,r.rx,r.ry].every(Number.isFinite) || r.rx <= 0 || r.ry <= 0 || r.x-r.rx < 0 || r.x+r.rx > 1 || r.y-r.ry < 0 || r.y+r.ry > 1) errors.push(`invalid region ${r.id}`);
  }
  for (let i=0;i<level.regions.length;i++) for (let j=i+1;j<level.regions.length;j++) {
    const a=level.regions[i]!, b=level.regions[j]!;
    if (Math.hypot(a.x-b.x,a.y-b.y) < Math.min(a.rx,b.rx)+Math.min(a.ry,b.ry)) errors.push('overlapping regions');
  }
  return errors;
}
