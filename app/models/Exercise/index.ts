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
  description: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    // two_sides_repeats - each hand, each leg, each breast side etc.
    // time_less - duration: less is better
    // time_more - duration: more is better
    enum: [ 'repeats', 'time', 'duration', 'distance' ],
    required: true,
  },
  each_side: {
    type: Boolean,
    default: false,
  },
  repeats: {
    type: Number,
    required: false,
  },
  // seconds
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
  }
});

ExerciseSchema.methods.updateExercise = function updateExercise(data) {
  const exercise = this;
  Object.assign(exercise, data);
  if (!data.image) exercise.image = undefined
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
