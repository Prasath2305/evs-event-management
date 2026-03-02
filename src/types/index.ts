// src/types/index.ts
export type UserRole = 'admin' | 'super_admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  department_id: string | null;
  created_at: string;
  departments?: {
    id: string;
    name: string;
    code: string;
  };
}

export type EventType = 
  | 'workshop' 
  | 'seminar' 
  | 'conference' 
  | 'webinar' 
  | 'competition' 
  | 'field_visit' 
  | 'awareness_campaign' 
  | 'tree_plantation' 
  | 'cleanliness_drive' 
  | 'other';

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface Department {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface Event {
  id: string;
  name: string;
  description: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string;
  theme: string | null;
  resource_person: string | null;
  resource_person_bio: string | null;
  department_id: string | null;
  event_type: EventType;
  expected_participants: number;
  actual_participants: number;
  flyer_url: string | null;
  flyer_path: string | null;
  status: EventStatus;
  is_featured: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  departments?: Department;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  participant_name: string;
  participant_email: string | null;
  participant_phone: string | null;
  registration_date: string;
  attended: boolean;
  feedback: string | null;
}

export interface EventFilters {
  department?: string;
  eventType?: EventType;
  dateRange?: 'this-week' | 'this-month' | 'upcoming' | 'past';
  searchQuery?: string;
}

export interface AnalyticsData {
  totalEvents: number;
  totalParticipants: number;
  monthlyTrends: { month: string; count: number; participants: number }[];
  departmentStats: { name: string; events: number; participants: number }[];
  eventTypeDistribution: { type: string; count: number }[];
}