import { Document } from 'mongoose';

export type SignupCode = {
  code: string;
  used: boolean;
  issued: boolean;
};

export interface ISignupCode extends SignupCode, Document {
}
