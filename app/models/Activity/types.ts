import { Document } from 'mongoose';

// TODO: add type here
export interface IActivityExercise extends Document {
  original_id: string;
  id_in_workout: number;
  hours: boolean;
  type: string;
  rounds: number[] | { right: number, left: number }[]
  note: string | null;
}

export type Activity = {
  workout_id: string;
  created_at?: string;
  updated_at?: string;
  date: string;
  results: IActivityExercise[];
  description: string;
  index: number;
  duration: number;
};

export interface IActivity extends Activity, Document {
  updateActivity(data: Activity): void;
}
