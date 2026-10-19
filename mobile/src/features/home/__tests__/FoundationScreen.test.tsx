import { fireEvent, render, screen } from '@testing-library/react-native';
import { FoundationScreen } from '../FoundationScreen';
const mockPush = jest.fn();
jest.mock('expo-router', () => ({ router: { push: (...args: unknown[]) => mockPush(...args) } }));
jest.mock('../../progress/useUnifiedProgress', () => ({ useUnifiedProgress: () => null }));
jest.mock('../../settings/Preferences', () => ({ usePreferences: () => ({ feedback: jest.fn() }) }));
describe('home screen', () => {
  beforeEach(() => mockPush.mockClear());
  it('shows three honest game cards and no fabricated progress', async () => {
    await render(<FoundationScreen />);
    expect(screen.getByText('BuddhiBox')).toBeTruthy();
    expect(screen.getByText('Find the Difference')).toBeTruthy();
    expect(screen.getByText('Maze Escape')).toBeTruthy();
    expect(screen.getByText('Word Search')).toBeTruthy();
    expect(screen.queryByText('Continue playing')).toBeNull();
    expect(screen.getByText('Loading local progress…')).toBeTruthy();
    expect(screen.queryByText('Your completed levels will appear here after your first clear.')).toBeNull();
  });
  it('opens the corresponding details route', async () => {
    await render(<FoundationScreen />);
    fireEvent.press(screen.getByRole('button', { name: /Explore Maze Escape/ }));
    expect(mockPush).toHaveBeenCalledWith('/games/maze');
  });
});
