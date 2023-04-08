import mongoose, { Schema } from 'mongoose';
import { IExercise, IImage } from './types';

export const ImageSchema = new Schema<IImage>({
  uid: {
    type: String,
    required: true,
  },
  uuid: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  uploaded_at: {
    type: Number,
    required: true,
  },
})
ImageSchema.methods.updateImage = function update(data) {
  const image = this
  Object.assign(image, data);
}

export const ImageModel = mongoose.models.ImageModel || mongoose.model<IImage>('Image', ImageSchema);


const ExerciseSchema = new Schema<IExercise>({
  image: {
    type: ImageSchema,
    required: false,
  },
  title: {
    type: String,
    required: true,
  },
  created_at: {
    type: String,
    required: false,
  },
  updated_at: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    // two_sides_repeats - each hand, each leg, each breast side etc.
    // time_less - duration: less is better
    // time_more - duration: more is better
    // TODO: replace time with time_repeats and time_distance
    enum: [ 'repeats', 'time', 'time_distance', 'time_repeats', 'duration', 'distance', 'weight' ],
    required: true,
  },
  each_side: {
    type: Boolean,
    default: false,
  },
  hours: {
    type: Boolean,
    default: false,
  },
  repeats: {
    type: Number,
    required: false,
  },
  is_in_workout: {
    type: Boolean,
    default: false,
  },
  in_workouts: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
  time: {
    type: Number,
    required: false,
  },
  weight: {
    type: Number,
    required: false,
  },
  mass_unit: {
    type: String,
    enum: [ 'kg', 'lb' ],
    required: false,
  },
  archived: {
    type: Boolean,
    default: false,
  },
});

ExerciseSchema.methods.updateExercise = function updateExercise(data) {
  const exercise = this;
  Object.assign(exercise, data);
  if (!data.image) exercise.image = undefined
}

ExerciseSchema.methods.removeFromWorkout = function removeFromWorkout(workoutId) {
  const exercise = this;
  exercise.in_workouts = exercise.in_workouts.filter(_workoutId => _workoutId.toString() !== workoutId.toString())
  if (exercise.in_workouts.length === 0) {
    exercise.is_in_workout = false
  }
}

ExerciseSchema.methods.updateImage = async function updateImage(data) {
  const exercise = this;
  if (!data) exercise.image = undefined
  else {
    let { image } = exercise
    image.updateImage(data)
  }
}

const ExerciseModel = mongoose.models.Exercise || mongoose.model<IExercise>('Exercise', ExerciseSchema);

export default ExerciseModel;
