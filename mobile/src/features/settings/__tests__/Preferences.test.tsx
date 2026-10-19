import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Switch } from 'react-native';
import { PreferencesProvider, usePreferences } from '../Preferences';
const mockStore: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key: string) => Promise.resolve(mockStore[key] ?? null)),
  setItem: jest.fn((key: string, value: string) => { mockStore[key] = value; return Promise.resolve(); }),
}));
jest.mock('expo-haptics', () => ({ selectionAsync: jest.fn(() => Promise.resolve()) }));
function Harness() {
  const { preferences, setHaptics, ready } = usePreferences();
  return <Switch accessibilityLabel="Touch feedback" disabled={!ready} value={preferences.haptics} onValueChange={value => void setHaptics(value)} />;
}
describe('local preference', () => {
  beforeEach(() => { delete mockStore['buddhibox.preferences.v1']; jest.clearAllMocks(); });
  it('persists and reloads the haptics setting', async () => {
    const view = await render(<PreferencesProvider><Harness /></PreferencesProvider>);
    const toggle = screen.getByRole('switch', { name: 'Touch feedback' });
    await waitFor(() => expect(toggle.props.accessibilityState?.disabled ?? toggle.props.disabled).toBe(false));
    await act(async () => { fireEvent(toggle, 'valueChange', true); });
    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalledWith('buddhibox.preferences.v1', '{"haptics":true}'));
    await view.unmount();
    await render(<PreferencesProvider><Harness /></PreferencesProvider>);
    await waitFor(() => expect(screen.getByRole('switch', { name: 'Touch feedback' }).props.value).toBe(true));
  });
});
