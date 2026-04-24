import { useState } from 'react';
import { useTrip } from '../store';
import type { TimelineItem } from '../types';
import { Edit2, Save, Trash2, Plus, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';

export const Timeline = () => {
  const { data, setData, pov, setIsDirty } = useTrip();
  const [editMode, setEditMode] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const isShared = pov === 'shared';

  const items = isShared 
    ? data.trip.sharedTimeline 
    : [...(data.trip.personalTimelines[pov] || []), ...data.trip.sharedTimeline].sort((a, b) => {
        const timeA = a.time || a.timeRange?.start || '23:59';
        const timeB = b.time || b.timeRange?.start || '23:59';
        return timeA.localeCompare(timeB);
      });

  // Group items artificially based on time (e.g. Morning, Afternoon, Evening)
  const groupedItems = items.reduce((acc, item) => {
    const timeStr = item.time || item.timeRange?.start || '00:00';
    const hour = parseInt(timeStr.split(':')[0], 10);
    let section = 'Morning (Before 12:00)';
    if (hour >= 12 && hour < 17) section = 'Afternoon (12:00 - 17:00)';
    if (hour >= 17) section = 'Evening (After 17:00)';
    
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, TimelineItem[]>);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: prev[section] === undefined ? false : !prev[section] }));
  };

  const updateItem = (id: string, updates: Partial<TimelineItem>, isPersonal: boolean) => {
    setData({
      ...data,
      trip: {
        ...data.trip,
        sharedTimeline: isPersonal ? data.trip.sharedTimeline : data.trip.sharedTimeline.map(item => item.id === id ? { ...item, ...updates } : item),
        personalTimelines: {
          ...data.trip.personalTimelines,
          [pov]: isPersonal ? (data.trip.personalTimelines[pov] || []).map(item => item.id === id ? { ...item, ...updates } : item) : data.trip.personalTimelines[pov]
        }
      }
    });
    setIsDirty(true);
  };

  const deleteItem = (id: string, isPersonal: boolean) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    setData({
      ...data,
      trip: {
        ...data.trip,
        sharedTimeline: isPersonal ? data.trip.sharedTimeline : data.trip.sharedTimeline.filter(item => item.id !== id),
        personalTimelines: {
          ...data.trip.personalTimelines,
          [pov]: isPersonal ? (data.trip.personalTimelines[pov] || []).filter(item => item.id !== id) : data.trip.personalTimelines[pov]
        }
      }
    });
    setIsDirty(true);
  };

  const addItem = () => {
    const newItem: TimelineItem = {
      id: `${pov}-${Date.now()}`,
      title: 'New Activity',
      time: '12:00',
      type: 'activity',
      location: '',
      notes: ''
    };
    
    if (isShared) {
      setData({
        ...data,
        trip: {
          ...data.trip,
          sharedTimeline: [...data.trip.sharedTimeline, newItem].sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59'))
        }
      });
    } else {
      setData({
        ...data,
        trip: {
          ...data.trip,
          personalTimelines: {
            ...data.trip.personalTimelines,
            [pov]: [...(data.trip.personalTimelines[pov] || []), newItem].sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59'))
          }
        }
      });
    }
    setIsDirty(true);
    setEditMode(newItem.id);
  };

  const moveItem = (index: number, direction: 'up' | 'down', isPersonal: boolean) => {
    const arr = isPersonal ? [...(data.trip.personalTimelines[pov] || [])] : [...data.trip.sharedTimeline];
    if (direction === 'up' && index > 0) {
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    } else if (direction === 'down' && index < arr.length - 1) {
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    } else {
      return;
    }
    
    setData({
      ...data,
      trip: {
        ...data.trip,
        sharedTimeline: isPersonal ? data.trip.sharedTimeline : arr,
        personalTimelines: {
          ...data.trip.personalTimelines,
          [pov]: isPersonal ? arr : data.trip.personalTimelines[pov]
        }
      }
    });
    setIsDirty(true);
  };

  return (
    <div className="p-4 space-y-6 pb-4">
      <div className="flex justify-between items-center bg-stone-100 p-3 rounded-xl border border-stone-200">
        <h2 className="text-xl font-bold text-stone-800">Timeline</h2>
        <button 
          onClick={addItem}
          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {Object.entries(groupedItems).map(([section, sectionItems]) => {
        const isExpanded = expandedSections[section] !== false; // Default true
        
        return (
          <div key={section} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <button 
              onClick={() => toggleSection(section)}
              className="w-full flex justify-between items-center p-4 bg-stone-50 hover:bg-stone-100 transition-colors border-b border-stone-200"
            >
              <h3 className="font-bold text-stone-700">{section}</h3>
              {isExpanded ? <ChevronUp size={20} className="text-stone-400" /> : <ChevronDown size={20} className="text-stone-400" />}
            </button>
            
            {isExpanded && (
              <div className="divide-y divide-stone-100">
                {sectionItems.map((item) => {
                  const isEditing = editMode === item.id;
                  const isPersonal = !data.trip.sharedTimeline.find(s => s.id === item.id);
                  // Find index in its respective array for moving
                  const arrayIndex = isPersonal 
                    ? (data.trip.personalTimelines[pov] || []).findIndex(i => i.id === item.id)
                    : data.trip.sharedTimeline.findIndex(i => i.id === item.id);
                  
                  return (
                    <div key={item.id} className="p-4 flex gap-4 items-start relative group">
                      <div className="flex flex-col items-center gap-2 mt-1 md:opacity-20 md:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => moveItem(arrayIndex, 'up', isPersonal)} className="p-1 hover:bg-stone-100 active:bg-stone-200 rounded text-stone-400 hover:text-stone-600"><ChevronUp size={16} /></button>
                        <GripVertical size={16} className="text-stone-300" />
                        <button onClick={() => moveItem(arrayIndex, 'down', isPersonal)} className="p-1 hover:bg-stone-100 active:bg-stone-200 rounded text-stone-400 hover:text-stone-600"><ChevronDown size={16} /></button>
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        {isEditing ? (
                          <div className="space-y-3 bg-stone-50 p-3 rounded-lg border border-stone-200">
                            <input 
                              type="text" 
                              value={item.time || item.timeRange?.start || ''} 
                              onChange={e => updateItem(item.id, { time: e.target.value, timeRange: undefined }, isPersonal)}
                              className="w-full p-2 text-sm border border-stone-300 rounded bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                              placeholder="Time (e.g. 08:00)"
                            />
                            <input 
                              type="text" 
                              value={item.title} 
                              onChange={e => updateItem(item.id, { title: e.target.value }, isPersonal)}
                              className="w-full p-2 text-base font-bold border border-stone-300 rounded bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                              placeholder="Title"
                            />
                            <input 
                              type="text" 
                              value={item.location || ''} 
                              onChange={e => updateItem(item.id, { location: e.target.value }, isPersonal)}
                              className="w-full p-2 text-sm border border-stone-300 rounded bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                              placeholder="Location"
                            />
                            <textarea 
                              value={item.notes || ''} 
                              onChange={e => updateItem(item.id, { notes: e.target.value }, isPersonal)}
                              className="w-full p-2 text-sm border border-stone-300 rounded bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none min-h-[80px]"
                              placeholder="Notes"
                            />
                            <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                              <button onClick={() => deleteItem(item.id, isPersonal)} className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete">
                                <Trash2 size={18} />
                              </button>
                              <button onClick={() => setEditMode(null)} className="flex items-center gap-1 bg-stone-800 hover:bg-stone-700 text-white px-4 py-2 rounded transition-colors text-sm font-medium">
                                <Save size={16} /> Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="group relative pr-8">
                            <div className="text-emerald-600 font-bold text-sm">
                              {item.time || `${item.timeRange?.start} - ${item.timeRange?.end}`}
                              {isPersonal && <span className="ml-2 text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider">{pov} only</span>}
                            </div>
                            <h4 className="font-bold text-stone-800 text-lg leading-tight mt-1">{item.title}</h4>
                            {item.location && <div className="text-stone-500 text-sm mt-1 flex items-center gap-1 font-medium">{item.location}</div>}
                            {item.notes && <p className="text-stone-600 text-sm mt-2 leading-relaxed bg-stone-50 p-2 rounded-md border border-stone-100">{item.notes}</p>}
                            
                            <button 
                              onClick={() => setEditMode(item.id)}
                              className="absolute top-0 right-0 p-2 text-stone-400 hover:text-stone-600 active:bg-stone-200 hover:bg-stone-100 rounded-full transition-all md:opacity-0 md:group-hover:opacity-100"
                            >
                              <Edit2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
