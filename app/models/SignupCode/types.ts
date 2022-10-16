import { Document } from 'mongoose';

export type SignupCode = {
  code: string;
};

export interface ISignupCode extends SignupCode, Document {
}
