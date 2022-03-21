import { Document } from 'mongoose';
import { Exercise, IExercise } from '../Exercise/types';

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
  password?: string;
  nickName?: string;
  firstName?: string;
  lastName?: string;
};

export interface IUser extends Document {
  email: string;
  password: string;
  nickName: string;
  firstName: string;
  lastName: string;
  exercises: Pick<Document, '_id'>[],
  authTokens: Token[];
  changePasswordToken?: string | null;

  isValidPassword(password: string): boolean;
  hashPassword(password: string): string;
  generateJWT(type: 'reset' | 'access' | 'pair'): string | Token;
  addToken(token: Token): Token;
  updateToken(type: 'reset' | 'access' | 'pair', token?: string): string | Token;
  generateChangePasswordUrl(): string;
  generateChangePasswordToken(): string;
  updateCredentials(credentials: Credentials): void;
  addExercise(exercise: IExercise): void;
  deleteExercises(ids: Pick<Document, '_id'>[]): Pick<IExercise, '_id'>[];
  deleteChangePasswordToken(): void;
  logout(refresh: string): void;
}
