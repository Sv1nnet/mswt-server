import { IUser } from '@/app/models/User/types';
import { IExercise, IImage } from '@/app/models/Exercise/types';
import _ from 'lodash';
import { IWorkout, IWorkoutExercise } from '../models/Workout/types';

export const pickUser = (user: IUser) => _.pick(user, ['email', 'nickName', 'firstName', 'lastName']);
export const pickProfile = (user: IUser) => _.pick(user, ['email', 'nickName', 'firstName', 'lastName']);
export const pickExercise = (exercise: IExercise) => ({ id: exercise._id, ..._.pick(exercise, ['title', 'each_side', 'type', 'repeats', 'time', 'weight', 'description', 'image', 'mass_unit']) });
export const pickExerciseList = (exercises: IExercise[]) => exercises.map(pickExercise);
export const pickImage = (image: IImage) => ({ ..._.pick(image, [ 'uid', 'uuid', 'name', 'url', 'uploaded_at' ]) });
export const pickWorkout = (workout: IWorkout) => ({ id: workout._id, ..._.pick(workout, ['title', 'exercises', 'description']) });
export const pickWorkoutList = (workouts: any[]) => workouts.map(pickWorkout);
export const pickWorkoutExercise = (workoutExercise: IWorkoutExercise) => ({ id: workoutExercise._id, ..._.pick(workoutExercise, ['rounds', 'round_break', 'break', 'break_enabled']) });
