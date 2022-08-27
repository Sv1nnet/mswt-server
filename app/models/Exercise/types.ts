import { Document } from 'mongoose';

export interface IImage extends Document {
  uid: string;
  name: string;
  uuid: string;
  url: string;
  uploaded_at: number;

  updateImage(data: Partial<IImage>): void;
}

export type Exercise = {
  title: string;
  each_side: boolean;
  type?: 'repeats' | 'time' | 'duration' | 'distance';
  time?: number;
  weight?: string;
  description?: string;
  image?: string;
};

export interface IExercise extends Document {
  title: string;
  each_side: boolean;
  type?: 'repeats' | 'time' | 'duration' | 'distance';
  time?: number;
  weight?: string;
  description?: string;
  image?: string;
  archived?: boolean;

  updateExercise(data: Exercise): void;
  updateImage(data: Partial<IImage>): void;
}
