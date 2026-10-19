import { fireEvent, render, screen } from '@testing-library/react-native';
import { WordGrid } from '../WordGrid';
import { pack } from '../puzzles';
import { freshWord, resumeWord } from '../session';
it('exposes Hindi cell units and coordinates as accessible native buttons',async()=>{
  const puzzle=pack('hi')[0]!,onCell=jest.fn();
  await render(<WordGrid puzzle={puzzle} session={resumeWord(freshWord(puzzle,'run'),0)} onCell={onCell} />);
  const start=puzzle.targets[1]!.cells[0]!,token=puzzle.grid[start.row]![start.col]!;
  fireEvent.press(screen.getByRole('button',{name:`Row ${start.row+1}, column ${start.col+1}, ${token}`}));
  expect(onCell).toHaveBeenCalledWith(start);
  expect(screen.getAllByText('कि').length).toBeGreaterThan(0);
});
