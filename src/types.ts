export type POV = 'shared' | 'wisli' | 'gab';

export interface TimeRange {
  start: string;
  end: string;
}

export interface TimelineItem {
  id: string;
  time?: string;
  timeRange?: TimeRange;
  title: string;
  type: string;
  location?: string;
  notes?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface Person {
  id: string;
  displayName: string;
  homeBase: string;
}

export interface HighLevelPlanEvent {
  time?: string;
  place?: string;
  meetPoint?: string;
  lateRule?: string;
  route?: string;
  from?: string;
  to?: string;
  depart?: string;
  arrive?: string;
  primaryDepart?: string;
  backupDepart?: string;
  platformArrivalWindow?: TimeRange;
  lineStrategy?: string;
  arriveTRAChiayiIfPrimary?: string;
  arriveTRAChiayiIfBackup?: string;
}

export interface TripData {
  schemaVersion: string;
  trip: {
    id: string;
    title: string;
    date: string;
    timezone: string;
    theme: string;
    highLevelPlan: Record<string, HighLevelPlanEvent>;
    people: Person[];
    personalTimelines: Record<string, TimelineItem[]>;
    sharedTimeline: TimelineItem[];
    checklists: {
      shared: {
        packing: ChecklistItem[];
        dayOf: ChecklistItem[];
      };
      personal: Record<string, ChecklistItem[]>;
    };
    links: Array<{ id: string; title: string; url: string; type: string }>;
    notes: string[];
  };
}

export interface Settings {
  owner: string;
  repo: string;
  branch: string;
  filePath: string;
  githubToken: string;
}
