import { useState } from 'react';
import { TripProvider } from './store';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Timeline } from './components/Timeline';
import { Checklists } from './components/Checklists';
import { Settings } from './components/Settings';
import { LayoutDashboard, Clock, CheckSquare, Settings as SettingsIcon } from 'lucide-react';

type Tab = 'dashboard' | 'timeline' | 'checklists' | 'settings';

function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="max-w-md mx-auto bg-stone-50 h-full relative shadow-2xl flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'timeline' && <Timeline />}
        {activeTab === 'checklists' && <Checklists />}
        {activeTab === 'settings' && <Settings />}
      </main>

      <nav className="bg-white border-t border-stone-200 flex justify-around p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] w-full z-50 shrink-0">
        {[
          { id: 'dashboard', icon: <LayoutDashboard size={24} />, label: 'Dashboard' },
          { id: 'timeline', icon: <Clock size={24} />, label: 'Timeline' },
          { id: 'checklists', icon: <CheckSquare size={24} />, label: 'Checklists' },
          { id: 'settings', icon: <SettingsIcon size={24} />, label: 'Settings' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${activeTab === tab.id ? 'text-emerald-600 font-bold' : 'text-stone-400 hover:text-stone-600'}`}
          >
            {tab.icon}
            <span className="text-[10px] mt-1 uppercase tracking-wide">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function App() {
  return (
    <TripProvider>
      <MainApp />
    </TripProvider>
  );
}

export default App;
