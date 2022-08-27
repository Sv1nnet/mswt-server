import mongoose, { Schema } from 'mongoose';
import { IWorkout, IWorkoutExercise } from './types';

export const WorkoutExerciseSchema = new Schema<IWorkoutExercise>({
  id: {
    type: String,
    required: true,
  },
  rounds: {
    type: Number,
    required: true,
  },
  round_break: {
    type: Number,
    required: true,
  },
  break: {
    type: Number,
    required: true,
  },
  break_enabled: {
    type: Boolean,
    required: true,
  },
})

export const WorkoutExerciseModel = mongoose.models.ImageModel || mongoose.model<IWorkoutExercise>('WorkoutExercise', WorkoutExerciseSchema);

const WorkoutSchema = new Schema<IWorkout>({
  title: {
    type: String,
    required: true,
  },
  exercises: {
    type: [WorkoutExerciseSchema],
    required: true,
    default: [],
  },
  description: {
    type: String,
    required: false,
  },
  archived: {
    type: Boolean,
    dafault: false,
  },
});

WorkoutSchema.methods.updateWorkout = function updateWorkout(data) {
  const workout = this;
  Object.assign(workout, data);
}

const WorkoutModel = mongoose.models.Workout || mongoose.model<IWorkout>('Workout', WorkoutSchema);

export default WorkoutModel;
