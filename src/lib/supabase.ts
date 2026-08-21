import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UniversityType = 'federal' | 'state' | 'private';

export interface University {
  id: string;
  name: string;
  short_name: string | null;
  state: string;
  city: string | null;
  type: UniversityType;
  website: string | null;
  established_year: number | null;
  description: string | null;
  last_verified: string;
  created_at: string;
}

export interface Course {
  id: string;
  university_id: string;
  name: string;
  degree: string | null;
  duration_years: number | null;
  estimated_fee_ngn: number | null;
  admission_requirements: string | null;
  last_verified: string;
  created_at: string;
}

export interface UniversityWithCourses extends University {
  courses: Course[];
}
