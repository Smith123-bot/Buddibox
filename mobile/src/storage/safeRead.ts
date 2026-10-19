import AsyncStorage from '@react-native-async-storage/async-storage';
/** Missing data is a new player; unreadable data is NOT a new player. Never overwrite it silently. */
export async function readSavedJson(key:string):Promise<unknown>{
  const raw=await AsyncStorage.getItem(key);
  if(raw===null)return null;
  let parsed:unknown;
  try{parsed=JSON.parse(raw)}catch{throw new Error(`Saved progress at ${key} is unreadable. Data was not overwritten.`)}
  if(!parsed||typeof parsed!=='object'||(parsed as {version?:unknown}).version!==1)throw new Error(`Saved progress at ${key} has an unsupported version. Data was not overwritten.`);
  return parsed
}
