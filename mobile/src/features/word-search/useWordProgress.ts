import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { loadWordProgress, type WordProgress } from '../../storage/wordProgress';
export function useWordProgress(){
  const [progress,setProgress]=useState<WordProgress|null>(null),[error,setError]=useState(false);
  useFocusEffect(useCallback(()=>{let active=true;setError(false);
    void loadWordProgress().then(p=>{if(active)setProgress(p)}).catch(()=>{if(active)setError(true)});
    return()=>{active=false};
  },[]));
  return {progress,error};
}
