import { useState } from 'react';
import { useTrip } from '../store';
import type { Settings as SettingsType } from '../types';
import { Save, AlertTriangle, Info } from 'lucide-react';

export const Settings = () => {
  const { settings, setSettings } = useTrip();
  const [localSettings, setLocalSettings] = useState<SettingsType>(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 space-y-6 pb-4">
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
        <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
          <AlertTriangle size={20} className="text-amber-500" />
          GitHub Sync Setup
        </h2>
        <p className="text-sm text-stone-600 mb-6 leading-relaxed">
          Configure your GitHub repository settings to enable syncing. This data is stored <b>only in your local browser</b> and is never sent anywhere else.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">GitHub Username / Org</label>
            <input 
              type="text" 
              value={localSettings.owner}
              onChange={e => setLocalSettings({...localSettings, owner: e.target.value})}
              className="w-full p-2.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              placeholder="e.g. your-username"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Repository Name</label>
            <input 
              type="text" 
              value={localSettings.repo}
              onChange={e => setLocalSettings({...localSettings, repo: e.target.value})}
              className="w-full p-2.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              placeholder="e.g. alishan-trip-hub"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Branch</label>
            <input 
              type="text" 
              value={localSettings.branch}
              onChange={e => setLocalSettings({...localSettings, branch: e.target.value})}
              className="w-full p-2.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              placeholder="e.g. main"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">File Path</label>
            <input 
              type="text" 
              value={localSettings.filePath}
              onChange={e => setLocalSettings({...localSettings, filePath: e.target.value})}
              className="w-full p-2.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              placeholder="e.g. data/trip.json"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Personal Access Token (PAT)</label>
            <input 
              type="password" 
              value={localSettings.githubToken}
              onChange={e => setLocalSettings({...localSettings, githubToken: e.target.value})}
              className="w-full p-2.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-mono"
              placeholder="github_pat_..."
            />
            <p className="text-xs text-stone-400 mt-2 flex items-start gap-1">
              <Info size={14} className="flex-shrink-0 mt-0.5" />
              <span>Generate a Fine-grained PAT with "Contents: Read & Write" access for this specific repository.</span>
            </p>
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2 mt-6 shadow-sm"
          >
            <Save size={20} />
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};
