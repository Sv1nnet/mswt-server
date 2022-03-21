import { IUser } from '@/app/models/User/types';
import { IExercise } from '@/app/models/Exercise/types';
import _ from 'lodash';

export const pickUser = (user: IUser) => _.pick(user, ['email', 'nickName', 'firstName', 'lastName']);
export const pickProfile = (user: IUser) => _.pick(user, ['email', 'nickName', 'firstName', 'lastName']);
export const pickExercise = (exercise: IExercise) => ({ id: exercise._id, ..._.pick(exercise, ['title', 'each_side', 'type', 'repeats', 'time', 'weight', 'description', 'image', 'mass_unit']) });
export const pickExerciseList = (exercises: IExercise[]) => exercises.map(pickExercise);
