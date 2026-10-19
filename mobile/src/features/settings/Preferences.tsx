import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';
const KEY = 'buddhibox.preferences.v1';
type Preferences = { haptics: boolean };
type ContextValue = { preferences: Preferences; ready: boolean; setHaptics: (value: boolean) => Promise<void>; feedback: () => void };
const PreferencesContext = createContext<ContextValue | null>(null);
export function PreferencesProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferences] = useState<Preferences>({ haptics: false });
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(KEY).then(raw => {
      if (active && raw) { const parsed: unknown = JSON.parse(raw); if (typeof parsed === 'object' && parsed !== null && 'haptics' in parsed && typeof parsed.haptics === 'boolean') setPreferences({ haptics: parsed.haptics }); }
    }).catch(() => { /* Keep safe default; storage failure must not block navigation. */ }).finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);
  const setHaptics = useCallback(async (value: boolean) => {
    const next = { haptics: value };
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    setPreferences(next);
  }, []);
  const feedback = useCallback(() => { if (preferences.haptics) void Haptics.selectionAsync().catch(() => {}); }, [preferences.haptics]);
  return <PreferencesContext.Provider value={{ preferences, ready, setHaptics, feedback }}>{children}</PreferencesContext.Provider>;
}
export function usePreferences() { const value = useContext(PreferencesContext); if (!value) throw new Error('PreferencesProvider missing'); return value; }
