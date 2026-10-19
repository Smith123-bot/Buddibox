import { fireEvent, render, screen } from '@testing-library/react-native';
import { GameCard } from '../../../components/GameCard';
it('opens details and announces that gameplay is not ready', async () => {
  const onPress = jest.fn();
  await render(<GameCard id="difference" onPress={onPress} />);
  fireEvent.press(screen.getByRole('button', { name: /Explore Find the Difference.*Playable now/ }));
  expect(onPress).toHaveBeenCalledTimes(1);
});
