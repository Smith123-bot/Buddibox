import { fireEvent, render, screen } from '@testing-library/react-native';
import { MazeBoard, mazeCellSize } from '../MazeBoard';
import { mazeLevels } from '../levels';
import { fresh } from '../session';
it('keeps square cells within available board width on narrow and wider layouts',()=>{
  expect(mazeCellSize(272,9)).toBe(30);
  expect(mazeCellSize(360,9)).toBe(40);
  expect(mazeCellSize(1000,9)).toBe(53);
  expect(mazeCellSize(0,9)).toBe(0);
  expect(mazeCellSize(360,0)).toBe(0);
});
it('exposes position and exit to accessibility without requiring visual color recognition',async()=>{
  const level=mazeLevels[0]!;
  await render(<MazeBoard level={level} session={fresh(level,'layout-test')} />);
  const board=screen.getByRole('image',{name:/Player row 1, column 1.*Exit row 4, column 4/});
  fireEvent(board,'layout',{nativeEvent:{layout:{width:280}}});
  expect(screen.getByRole('image',{name:/Maze board: 4 rows and 4 columns/})).toBeTruthy();
});
