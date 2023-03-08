import mongoose, { Schema } from 'mongoose';
import { IActivity, IActivityExercise } from './types';

export const ActivityExerciseSchema = new Schema<IActivityExercise>({
  original_id: {
    type: String,
    required: true,
  },
  id_in_workout: {
    type: String,
    required: true,
  },
  hours: {
    type: Boolean,
    required: false,
    default: false,
  },
  type: {
    type: String,
    required: true,
  },
  rounds: {
    type: Schema.Types.Mixed, // number[] | { right: number, left: number }[]
    required: true,
  },
  note: {
    type: String,
    required: false,
  }
})

export const ActivityExerciseModel = mongoose.models.ActivityExerciseModel || mongoose.model<IActivityExercise>('ActivityExercise', ActivityExerciseSchema);

const ActivitySchema = new Schema<IActivity>({
  workout_id: {
    type: String,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  created_at: {
    type: String,
    requred: false,
  },
  updated_at: {
    type: String,
    required: false,
  },
  date: {
    type: String,
    required: true,
  },
  results: {
    type: [ActivityExerciseSchema],
    required: true,
    default: [],
  },
  description: {
    type: String,
    required: false,
  },
  duration: {
    type: Number,
    default: 0,
  }
});

ActivitySchema.methods.updateActivity = function updateActivity(data) {
  const activity = this;
  Object.assign(activity, {
    ...data,
    index: new Date(data.date).valueOf(),
  });
}

const ActivityModel = mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);

export default ActivityModel;
