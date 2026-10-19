import { render, screen } from '@testing-library/react-native';
import Home from '../../../app/(tabs)/index';
import Progress from '../../../app/(tabs)/progress';
import Profile from '../../../app/(tabs)/profile';
import type { UnifiedState } from '../useUnifiedProgress';
const mockPush=jest.fn();let mockState:UnifiedState|null=null;
jest.mock('expo-router',()=>({router:{push:(...args:unknown[])=>mockPush(...args)}}));
jest.mock('../useUnifiedProgress',()=>({useUnifiedProgress:()=>mockState}));
jest.mock('../../settings/Preferences',()=>({usePreferences:()=>({feedback:jest.fn()})}));
beforeEach(()=>{mockState=null;mockPush.mockClear()});
it('shows honest empty/loading states on Home, Profile and Progress',async()=>{
  await render(<Home />);expect(screen.getByText('Loading local progress…')).toBeTruthy();
  await render(<Profile />);expect(screen.getByText('Local player')).toBeTruthy();
  await render(<Progress />);expect(screen.getByText('Loading local progress…')).toBeTruthy();
});
it('renders real unified counts, recent activity and no unsupported game cards',async()=>{
  mockState={
    sources:{difference:null,maze:null,word:null},grants:{version:1,earned:{FIRST_WIN:1000}},achievementError:false,
    summary:{games:[
      {id:'difference',title:'Find the Difference',completedUnique:1,totalLevels:3,clears:1,attempts:2,bestScore:450,unlocked:2,recent:null,recordedHints:0,recordedEffort:0},
      {id:'maze',title:'Maze Escape',completedUnique:0,totalLevels:8,clears:0,attempts:0,bestScore:null,unlocked:1,recent:null,recordedHints:0,recordedEffort:0},
      {id:'word',title:'Word Search',completedUnique:0,totalLevels:10,clears:0,attempts:0,bestScore:null,unlocked:2,recent:null,recordedHints:0,recordedEffort:null},
    ],totalUnique:1,totalClears:1,totalAttempts:2,gamesPlayed:1,recent:[],recordedHints:0,recordedWordFinds:0,distinctWordsFound:0,hasLegacyRuns:true},
  };
  const home=await render(<Home />);expect(screen.getByText(/1 distinct levels cleared/)).toBeTruthy();
  await home.unmount();
  const progress=await render(<Progress />);expect(screen.getAllByText(/2 attempts/).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/2 unlocked/).length).toBeGreaterThan(0);
  expect(screen.getByText(/No dated results yet/)).toBeTruthy();
  await progress.unmount();
  await render(<Profile />);expect(screen.getByText(/1 achievements unlocked/)).toBeTruthy();
});
it('shows a storage-read error instead of fabricated zero stats',async()=>{
  mockState={sources:{difference:null,maze:null,word:null},grants:null,achievementError:true,loadError:true,
    summary:{games:[],totalUnique:0,totalClears:0,totalAttempts:0,gamesPlayed:0,recent:[],recordedHints:0,recordedWordFinds:0,distinctWordsFound:0,hasLegacyRuns:false}};
  const progress=await render(<Progress />);
  expect(screen.getByText('Progress unavailable')).toBeTruthy();
  expect(screen.queryByText(/0 distinct levels cleared/)).toBeNull();
  await progress.unmount();
  await render(<Profile />);
  expect(screen.getByText(/Saved progress could not be read/)).toBeTruthy();
});
