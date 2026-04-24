import { useTrip } from '../store';
import type { TimelineItem } from '../types';
import { Clock, MapPin, Navigation } from 'lucide-react';
import { parse, isAfter, isBefore } from 'date-fns';

export const Dashboard = () => {
  const { data, pov } = useTrip();
  const now = new Date(); // Use current real time
  
  // Helper to parse time string like "08:00" to today's date for comparison
  const parseTime = (timeStr: string) => {
    return parse(timeStr, 'HH:mm', now);
  };

  const getCombinedTimeline = (): TimelineItem[] => {
    const shared = data.trip.sharedTimeline || [];
    if (pov === 'shared') return shared;
    const personal = data.trip.personalTimelines[pov] || [];
    
    // Sort by start time
    return [...personal, ...shared].sort((a, b) => {
      const timeA = a.time || a.timeRange?.start || '23:59';
      const timeB = b.time || b.timeRange?.start || '23:59';
      return timeA.localeCompare(timeB);
    });
  };

  const timeline = getCombinedTimeline();
  
  // Find current and next step
  let currentStep: TimelineItem | null = null;
  let nextStep: TimelineItem | null = null;

  for (let i = 0; i < timeline.length; i++) {
    const item = timeline[i];
    const startTimeStr = item.time || item.timeRange?.start;
    const endTimeStr = item.timeRange?.end || item.time;
    
    if (startTimeStr && endTimeStr) {
      const start = parseTime(startTimeStr);
      const end = parseTime(endTimeStr);
      
      if (isAfter(now, start) && isBefore(now, end)) {
        currentStep = item;
        nextStep = timeline[i + 1] || null;
        break;
      }
      
      if (isBefore(now, start)) {
        nextStep = item;
        break;
      }
    }
  }

  // If we are past all steps
  if (!currentStep && !nextStep && timeline.length > 0) {
    const lastItem = timeline[timeline.length - 1];
    const lastTime = parseTime(lastItem.timeRange?.end || lastItem.time || '23:59');
    if (isAfter(now, lastTime)) {
      currentStep = { id: 'done', title: 'Trip Complete!', type: 'info', time: 'Now' };
    } else {
      nextStep = timeline[0]; // If we are before everything
    }
  }

  return (
    <div className="p-4 space-y-6">
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-2xl p-5 text-white shadow-xl">
        <h2 className="text-emerald-200 text-sm font-semibold uppercase tracking-wider mb-1">Trip Overview</h2>
        <h3 className="text-2xl font-bold mb-2">{data.trip.title}</h3>
        <div className="flex items-center gap-2 text-emerald-100/80 text-sm mb-4">
          <Clock size={14} />
          <span>{data.trip.date}</span>
        </div>
        <p className="text-sm italic opacity-90">"{data.trip.theme}"</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-stone-800 border-b pb-2">Status</h3>
        
        {currentStep && currentStep.id !== 'done' && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 shadow-sm">
            <div className="text-xs font-bold text-emerald-600 uppercase mb-2 flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Happening Now
            </div>
            <h4 className="font-bold text-stone-800 text-lg">{currentStep.title}</h4>
            <div className="mt-2 space-y-1 text-sm text-stone-600">
              <div className="flex items-center gap-2"><Clock size={14} className="text-emerald-500" /> {currentStep.time || `${currentStep.timeRange?.start} - ${currentStep.timeRange?.end}`}</div>
              {currentStep.location && <div className="flex items-center gap-2"><MapPin size={14} className="text-emerald-500" /> {currentStep.location}</div>}
            </div>
          </div>
        )}
        
        {nextStep && (
          <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs font-bold text-stone-400 uppercase mb-2 flex items-center gap-1">
              <Navigation size={14} /> Up Next
            </div>
            <h4 className="font-bold text-stone-800 text-lg">{nextStep.title}</h4>
            <div className="mt-2 space-y-1 text-sm text-stone-600">
              <div className="flex items-center gap-2"><Clock size={14} className="text-stone-400" /> {nextStep.time || `${nextStep.timeRange?.start} - ${nextStep.timeRange?.end}`}</div>
              {nextStep.location && <div className="flex items-center gap-2"><MapPin size={14} className="text-stone-400" /> {nextStep.location}</div>}
              {nextStep.notes && <p className="mt-2 text-stone-500 italic text-sm">{nextStep.notes}</p>}
            </div>
          </div>
        )}

        {currentStep?.id === 'done' && (
          <div className="bg-stone-100 rounded-xl p-4 text-center text-stone-500">
            <p className="font-medium">The trip has concluded.</p>
            <p className="text-sm mt-1">Hope you had a great time!</p>
          </div>
        )}
      </div>

      {data.trip.notes && data.trip.notes.length > 0 && (
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <h4 className="font-bold text-amber-800 mb-2 text-sm uppercase">Important Notes</h4>
          <ul className="list-disc pl-4 space-y-1 text-sm text-amber-700/80">
            {data.trip.notes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
