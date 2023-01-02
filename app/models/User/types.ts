import { Document } from 'mongoose';
import { IActivity } from '../Activity/types';
import { Exercise, IExercise } from '../Exercise/types';
import { IWorkout } from '../Workout/types';

export type Refresh = string;
export type Access = string;

export type Token = {
  refresh: Refresh;
  access: Access;
};

export type Decoded = {
  email: string;
  _id: string;
  iat: number;
  exp: number;
};

export type Credentials = {
  email?: string;
  signup_code?: string;
  password?: string;
  nickName?: string;
  firstName?: string;
  lastName?: string;
  settings?: { lang: 'eng' | 'ru' };
};

export interface IUser extends Document {
  email: string;
  signup_code: string;
  password: string;
  nickName: string;
  firstName: string;
  lastName: string;
  exercises: Pick<Document, '_id'>[],
  workouts: Pick<Document, '_id'>[],
  activities: Pick<Document, '_id'>[],
  authTokens: Token[];
  settings: { lang: 'eng' | 'ru' };
  changePasswordToken?: string | null;

  isValidPassword(password: string): boolean;
  hashPassword(password: string): string;
  
  generateJWT(type: 'reset' | 'access' | 'pair'): string | Token;
  addToken(token: Token): Token;
  updateToken(type: 'reset' | 'access' | 'pair', token?: string): string | Token;
  generateChangePasswordUrl(): string;
  generateChangePasswordToken(): string;
  deleteChangePasswordToken(): void;
  
  updateCredentials(credentials: Credentials): void;
  
  addExercise(exercise: IExercise): void;
  deleteExercises(ids: Pick<Document, '_id'>[]): Pick<IExercise, '_id'>[];

  addWorkout(workout: IWorkout): void;
  deleteWorkouts(ids: Pick<Document, '_id'>[]): Pick<IWorkout, '_id'>[];

  addActivity(activity: IActivity): void;
  deleteActivities(ids: Pick<Document, '_id'>[]): Pick<IActivity, '_id'>[];
  updateActivitiesOrderByIndex(activities: IActivity[]): IActivity[];

  logout(refresh: string): void;
}
