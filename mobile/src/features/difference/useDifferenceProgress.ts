import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { loadProgress, type DifferenceProgress } from '../../storage/differenceProgress';
export function useDifferenceProgress(){
  const [progress,setProgress]=useState<DifferenceProgress|null>(null);
  useFocusEffect(useCallback(()=>{let active=true;void loadProgress().then(result=>{if(active)setProgress(result)}).catch(()=>{/* This legacy hook has no UI consumer; gameplay screens report storage errors. */});return()=>{active=false}},[]));
  return progress;
}
