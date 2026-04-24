import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { TripData, Settings, POV } from './types';
import initialData from '../data/trip.json';

interface TripContextType {
  data: TripData;
  setData: (data: TripData) => void;
  settings: Settings;
  setSettings: (settings: Settings) => void;
  pov: POV;
  setPov: (pov: POV) => void;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  lastLoaded: Date | null;
  setLastLoaded: (date: Date | null) => void;
  lastSynced: Date | null;
  setLastSynced: (date: Date | null) => void;
  currentSha: string | null;
  setCurrentSha: (sha: string | null) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) throw new Error('useTrip must be used within TripProvider');
  return context;
};

const DEFAULT_SETTINGS: Settings = {
  owner: '',
  repo: 'alishan-trip-hub',
  branch: 'main',
  filePath: 'data/trip.json',
  githubToken: ''
};

export const TripProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<TripData>(initialData as TripData);
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);
  const [pov, setPov] = useState<POV>('shared');
  const [isDirty, setIsDirty] = useState(false);
  const [lastLoaded, setLastLoaded] = useState<Date | null>(new Date());
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [currentSha, setCurrentSha] = useState<string | null>(null);

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tripHubSettings');
    if (saved) {
      try {
        setSettingsState({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to parse settings');
      }
    }
  }, []);

  const setSettings = (newSettings: Settings) => {
    setSettingsState(newSettings);
    localStorage.setItem('tripHubSettings', JSON.stringify(newSettings));
  };

  return (
    <TripContext.Provider value={{
      data, setData,
      settings, setSettings,
      pov, setPov,
      isDirty, setIsDirty,
      lastLoaded, setLastLoaded,
      lastSynced, setLastSynced,
      currentSha, setCurrentSha
    }}>
      {children}
    </TripContext.Provider>
  );
};
