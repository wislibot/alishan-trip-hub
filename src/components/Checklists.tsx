import { useTrip } from '../store';
import type { ChecklistItem } from '../types';
import { CheckSquare, Square, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';

export const Checklists = () => {
  const { data, setData, pov, setIsDirty } = useTrip();
  const [newItemLabel, setNewItemLabel] = useState('');
  const [addingTo, setAddingTo] = useState<string | null>(null);

  const toggleItem = (listPath: string[], id: string) => {
    let newChecklists = JSON.parse(JSON.stringify(data.trip.checklists));
    let currentLevel = newChecklists;
    
    for (let i = 0; i < listPath.length - 1; i++) {
      currentLevel = currentLevel[listPath[i]];
    }
    
    const targetArray = currentLevel[listPath[listPath.length - 1]] as ChecklistItem[];
    const itemIndex = targetArray.findIndex(i => i.id === id);
    if (itemIndex > -1) {
      targetArray[itemIndex].checked = !targetArray[itemIndex].checked;
      setData({
        ...data,
        trip: {
          ...data.trip,
          checklists: newChecklists
        }
      });
      setIsDirty(true);
    }
  };

  const addItem = (listPath: string[]) => {
    if (!newItemLabel.trim()) return;
    
    let newChecklists = JSON.parse(JSON.stringify(data.trip.checklists));
    let currentLevel = newChecklists;
    
    for (let i = 0; i < listPath.length - 1; i++) {
      if (!currentLevel[listPath[i]]) currentLevel[listPath[i]] = {};
      currentLevel = currentLevel[listPath[i]];
    }
    
    const arrayKey = listPath[listPath.length - 1];
    if (!currentLevel[arrayKey]) currentLevel[arrayKey] = [];
    
    currentLevel[arrayKey].push({
      id: `${listPath.join('-')}-${Date.now()}`,
      label: newItemLabel.trim(),
      checked: false
    });
    
    setData({
      ...data,
      trip: {
        ...data.trip,
        checklists: newChecklists
      }
    });
    setIsDirty(true);
    setNewItemLabel('');
    setAddingTo(null);
  };

  const deleteItem = (listPath: string[], id: string) => {
    let newChecklists = JSON.parse(JSON.stringify(data.trip.checklists));
    let currentLevel = newChecklists;
    
    for (let i = 0; i < listPath.length - 1; i++) {
      currentLevel = currentLevel[listPath[i]];
    }
    
    const arrayKey = listPath[listPath.length - 1];
    currentLevel[arrayKey] = currentLevel[arrayKey].filter((i: ChecklistItem) => i.id !== id);
    
    setData({
      ...data,
      trip: {
        ...data.trip,
        checklists: newChecklists
      }
    });
    setIsDirty(true);
  };

  const renderChecklist = (title: string, listPath: string[], items: ChecklistItem[]) => {
    const listKey = listPath.join('-');
    const completedCount = items?.filter(i => i.checked).length || 0;
    const totalCount = items?.length || 0;
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden mb-6">
        <div className="bg-stone-50 border-b border-stone-200 p-4 flex justify-between items-center">
          <h3 className="font-bold text-stone-800 text-lg flex items-center gap-2">
            {title}
            <span className="text-xs font-medium bg-stone-200 text-stone-600 px-2 py-1 rounded-full">
              {completedCount} / {totalCount}
            </span>
          </h3>
          <button 
            onClick={() => setAddingTo(addingTo === listKey ? null : listKey)}
            className="text-stone-500 hover:text-emerald-600 transition-colors p-1"
          >
            <Plus size={20} />
          </button>
        </div>
        
        <div className="p-2">
          {items?.map(item => (
            <div 
              key={item.id} 
              className={`group flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer ${item.checked ? 'opacity-60' : ''}`}
              onClick={() => toggleItem(listPath, item.id)}
            >
              <button className={`flex-shrink-0 transition-colors ${item.checked ? 'text-emerald-500' : 'text-stone-300 hover:text-stone-400'}`}>
                {item.checked ? <CheckSquare size={24} /> : <Square size={24} />}
              </button>
              <span className={`flex-1 text-base transition-all ${item.checked ? 'line-through text-stone-400' : 'text-stone-700 font-medium'}`}>
                {item.label}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteItem(listPath, item.id); }}
                className="text-stone-400 hover:text-red-500 md:opacity-0 md:group-hover:opacity-100 transition-all p-2 rounded-full hover:bg-red-50 active:bg-red-100"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          
          {items?.length === 0 && (
            <p className="text-stone-400 text-center py-4 text-sm">No items in this list.</p>
          )}
          
          {addingTo === listKey && (
            <div className="p-3 mt-2 flex gap-2">
              <input
                type="text"
                value={newItemLabel}
                onChange={e => setNewItemLabel(e.target.value)}
                placeholder="New item..."
                className="flex-1 p-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && addItem(listPath)}
              />
              <button 
                onClick={() => addItem(listPath)}
                className="bg-stone-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const sharedChecklists = data.trip.checklists?.shared || { packing: [], dayOf: [] };
  const personalChecklists = data.trip.checklists?.personal?.[pov] || [];

  return (
    <div className="p-4 pb-4">
      {renderChecklist('Shared Packing', ['shared', 'packing'], sharedChecklists.packing)}
      {renderChecklist('Shared Day-Of', ['shared', 'dayOf'], sharedChecklists.dayOf)}
      
      {pov !== 'shared' && (
        renderChecklist(`${pov.charAt(0).toUpperCase() + pov.slice(1)}'s Personal List`, ['personal', pov], personalChecklists)
      )}
    </div>
  );
};
