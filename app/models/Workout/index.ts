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
  }
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
    default: false,
  },
  is_in_activity: {
    type: Boolean,
    default: false,
  },
  in_activities: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
});

WorkoutSchema.methods.addActivity = function addActivity(activityId) {
  const workout = this;
  workout.is_in_activity = true;
  workout.in_activities.push(activityId)
}

WorkoutSchema.methods.updateWorkout = function updateWorkout(data) {
  const workout = this;
  Object.assign(workout, data);
}

WorkoutSchema.methods.removeFromActivity = function removeFromActivity(activityId) {
  const workout = this;
  workout.in_activities = workout.in_activities?.filter(_activityId => _activityId.toString() !== activityId.toString()) || []
  if (workout.in_activities.length === 0) {
    workout.is_in_activity = false
  }
}

const WorkoutModel = mongoose.models.Workout || mongoose.model<IWorkout>('Workout', WorkoutSchema);

export default WorkoutModel;
