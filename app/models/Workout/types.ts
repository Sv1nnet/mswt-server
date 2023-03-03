import { Document } from 'mongoose';

export interface IWorkoutExercise extends Document {
  id: string;
  rounds: number;
  round_break: number;
  break?: number;
  break_enabled: boolean;
}

export type Workout = {
  title: string;
  exercises: IWorkoutExercise[];
  is_in_activity: boolean;
  in_activities: Document["_id"][];
  description?: string;
};

export interface IWorkout extends Document {
  title: string;
  exercises: IWorkoutExercise[];
  is_in_activity: boolean;
  in_activities: Document["_id"][];
  description?: string;
  archived?: boolean;

  updateWorkout(data: Partial<Workout>): void;
  addActivity(activityId: string | Document["_id"]): void;
  removeFromActivity(activityId: string | Document["_id"]): void;
}
