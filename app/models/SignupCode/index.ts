import mongoose, { Schema } from 'mongoose';
import { ISignupCode } from './types';

const SignupCodeSchema = new Schema<ISignupCode>({
  code: {
    type: String,
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
  issued: {
    type: Boolean,
    default: false,
  },
});

const SignupCodeModel = mongoose.models.SignupCode || mongoose.model<ISignupCode>('SignupCode', SignupCodeSchema);

export default SignupCodeModel;
