import { RefreshCw, UploadCloud, AlertCircle } from 'lucide-react';
import { useTrip } from '../store';
import { fetchTripData, updateTripData } from '../api/github';
import { useState } from 'react';

export const Header = () => {
  const { 
    settings, pov, setPov, data, setData, 
    isDirty, setIsDirty, 
    setLastLoaded,
    setLastSynced,
    currentSha, setCurrentSha 
  } = useTrip();
  
  const [syncing, setSyncing] = useState(false);
  const [conflict, setConflict] = useState(false);

  const canSync = settings.owner && settings.githubToken && settings.repo;

  const handlePull = async () => {
    if (!canSync) return alert('Configure settings first');
    setSyncing(true);
    try {
      const { data: newData, sha } = await fetchTripData(settings);
      setData(newData);
      setCurrentSha(sha);
      setLastLoaded(new Date());
      setIsDirty(false);
      setConflict(false);
    } catch (err) {
      console.error(err);
      alert('Failed to load from GitHub');
    } finally {
      setSyncing(false);
    }
  };

  const handlePush = async () => {
    if (!canSync) return alert('Configure settings first');
    if (!currentSha) return handlePull(); // Need to fetch first
    setSyncing(true);
    try {
      const { newSha } = await updateTripData(settings, data, currentSha);
      setCurrentSha(newSha);
      setLastSynced(new Date());
      setIsDirty(false);
    } catch (err: any) {
      if (err.message === 'CONFLICT') {
        setConflict(true);
      } else {
        alert('Failed to sync to GitHub');
      }
    } finally {
      setSyncing(false);
    }
  };

  return (
    <header className="bg-stone-900 text-stone-100 p-4 shrink-0 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold tracking-tight">Trip Hub</h1>
        
        <div className="flex items-center gap-3">
          {conflict ? (
            <div className="flex items-center text-red-400 text-sm gap-1 bg-red-900/20 px-2 py-1 rounded">
              <AlertCircle size={16} /> Conflict
            </div>
          ) : (
            <div className={`text-xs px-2 py-1 rounded-full ${isDirty ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
              {isDirty ? 'Unsaved Edits' : 'Synced'}
            </div>
          )}
          
          <button 
            onClick={handlePull} 
            disabled={syncing || !canSync}
            className="p-2 hover:bg-stone-800 rounded-full transition-colors disabled:opacity-50"
            title="Reload from GitHub"
          >
            <RefreshCw size={20} className={syncing ? 'animate-spin' : ''} />
          </button>
          
          <button 
            onClick={handlePush} 
            disabled={syncing || !canSync || !isDirty}
            className={`p-2 rounded-full transition-colors disabled:opacity-50 ${isDirty ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'hover:bg-stone-800 text-stone-400'}`}
            title="Sync to GitHub"
          >
            <UploadCloud size={20} />
          </button>
        </div>
      </div>
      
      {conflict && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm mb-4">
          <p className="font-semibold mb-1">Someone updated the plan.</p>
          <p>Please reload to get the latest, then re-apply your edits.</p>
          <button onClick={handlePull} className="mt-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors">
            Reload from GitHub
          </button>
        </div>
      )}
      
      <div className="flex bg-stone-800 p-1 rounded-lg">
        {(['shared', 'wisli', 'gab'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPov(p)}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${pov === p ? 'bg-stone-700 text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'}`}
          >
            {p}
          </button>
        ))}
      </div>
    </header>
  );
};
