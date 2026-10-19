import { render, screen } from '@testing-library/react-native';
import AboutScreen from '../../../app/about';

it('describes implemented offline games and local progress without claiming cloud backup', async () => {
  await render(<AboutScreen />);
  expect(screen.getByText(/Find the Difference, Maze Escape, and English or Hindi Word Search offline/)).toBeTruthy();
  expect(screen.getByText(/Completed levels and achievements are saved locally/)).toBeTruthy();
  expect(screen.queryByText(/have not been implemented yet/)).toBeNull();
});
