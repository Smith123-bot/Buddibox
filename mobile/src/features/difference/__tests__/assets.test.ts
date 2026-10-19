import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { levels, validateLevel } from '../levels';

it('ships six distinct valid 900×600 PNG images for three five-target scenes', () => {
  expect(levels).toHaveLength(3);
  const root=resolve(__dirname,'../../../../assets/games/find-the-difference');
  const names=['garden','harbor','night-market'];
  expect(new Set(levels.map(level=>level.id)).size).toBe(3);
  for(const [index,level] of levels.entries()){
    expect(validateLevel(level)).toEqual([]);
    expect(level.regions).toHaveLength(5);
    const images=['a.png','b.png'].map(name=>readFileSync(resolve(root,names[index]!,name)));
    for(const image of images){
      expect(image.subarray(0,8).toString('hex')).toBe('89504e470d0a1a0a');
      expect(image.readUInt32BE(16)).toBe(900);
      expect(image.readUInt32BE(20)).toBe(600);
    }
    expect(images[0]!.equals(images[1]!)).toBe(false);
  }
});
