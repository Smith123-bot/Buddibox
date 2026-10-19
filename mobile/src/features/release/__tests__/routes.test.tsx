import { fireEvent, render, screen } from '@testing-library/react-native';
import GameDetails from '../../../app/games/[id]';
const mockPush=jest.fn(),mockReplace=jest.fn();let mockId='difference';
jest.mock('expo-router',()=>({router:{push:(...args:unknown[])=>mockPush(...args),replace:(...args:unknown[])=>mockReplace(...args),back:jest.fn()},useLocalSearchParams:()=>({id:mockId})}));
beforeEach(()=>{mockPush.mockClear();mockReplace.mockClear()});
it.each([['difference','/difference'],['maze','/maze'],['word-search','/word-search']])('routes %s to its existing level selector',async(id,route)=>{
  mockId=id;await render(<GameDetails />);
  fireEvent.press(screen.getByRole('button',{name:'Choose a level'}));
  expect(mockPush).toHaveBeenCalledWith(route);
});
it('shows a safe route for an unknown game',async()=>{
  mockId='not-a-game';await render(<GameDetails />);
  expect(screen.getByText('Game not found')).toBeTruthy();
  fireEvent.press(screen.getByRole('button',{name:'Back to games'}));
  expect(mockReplace).toHaveBeenCalledWith('/games');
});
