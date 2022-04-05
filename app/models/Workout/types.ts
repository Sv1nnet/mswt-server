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
  description?: string;
};

export interface IWorkout extends Document {
  title: string;
  exercises: IWorkoutExercise[];
  description?: string;

  updateWorkout(data: Workout): void;
}
