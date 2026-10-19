import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { loadMazeProgress, type MazeProgress } from '../../storage/mazeProgress';
export function useMazeProgress(){
  const [progress,setProgress]=useState<MazeProgress|null>(null),[error,setError]=useState(false);
  useFocusEffect(useCallback(()=>{let active=true;setError(false);
    void loadMazeProgress().then(p=>{if(active)setProgress(p)}).catch(()=>{if(active)setError(true)});
    return()=>{active=false};
  },[]));
  return {progress,error};
}
