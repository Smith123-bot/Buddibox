import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { loadProgress } from '../../storage/differenceProgress';
import { loadMazeProgress } from '../../storage/mazeProgress';
import { loadWordProgress } from '../../storage/wordProgress';
import { reconcileGrants, type Grants } from '../../storage/achievementProgress';
import { aggregate, type ProgressSources, type ProgressSummary } from './model';
export type UnifiedState={sources:ProgressSources;summary:ProgressSummary;grants:Grants|null;achievementError:boolean;loadError?:boolean};
export function useUnifiedProgress(){
  const [value,setValue]=useState<UnifiedState|null>(null);
  useFocusEffect(useCallback(()=>{
    let active=true;
    void Promise.all([loadProgress(),loadMazeProgress(),loadWordProgress()]).then(async([difference,maze,word])=>{
      const sources={difference,maze,word},summary=aggregate(sources);
      let grants:Grants|null=null,achievementError=false;
      try{grants=await reconcileGrants(summary)}catch{achievementError=true}
      if(active)setValue({sources,summary,grants,achievementError});
    }).catch(()=>{if(active)setValue({sources:{difference:null,maze:null,word:null},summary:aggregate({difference:null,maze:null,word:null}),grants:null,achievementError:true,loadError:true})});return()=>{active=false};
  },[]));
  return value;
}
