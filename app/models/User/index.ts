import mongoose, { Schema } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IUser, Token, Credentials } from './types';

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    minlength: 5,
    trim: true,
    unique: true,
    validate: {
      validator(email: string): boolean {
        return validator.isEmail(email);
      },
      message: '{VALUE} is not a valid email.',
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  nickName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  firstName: {
    type: String,
    required: false,
    trim: true,
  },
  lastName: {
    type: String,
    required: false,
    trim: true,
  },
  authTokens: {
    type: [
      {
        access: {
          type: String,
          required: true,
        },
        refresh: {
          type: String,
          required: true,
        },
      },
    ],
    default: [],
  },
  changePasswordToken: {
    type: String,
    default: null,
  },
});

UserSchema.methods.isValidPassword = function isValidPassword(password: string): boolean {
  const user: IUser = this;
  return bcrypt.compareSync(password, user.password);
};

UserSchema.methods.hashPassword = function hashPassword(password: string): string {
  const user: IUser = this;
  user.password = bcrypt.hashSync(password, 10);

  return user.password;
};

UserSchema.methods.generateJWT = function generateJWT(type: 'reset' | 'access' | 'pair'): string | Token {
  const user: IUser = this;
  const secret = process.env[`JWT_${type.toUpperCase()}_SECRET`]!;
  if (type !== 'pair') {
    return jwt.sign(
      {
        _id: user._id,
      },
      secret,
      { expiresIn: type === 'reset' ? '1h' : '15m' }
    );
  }

  const access = jwt.sign(
    {
      _id: user._id,
    },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: '15m' }
  );
  const refresh = jwt.sign(
    {
      _id: user._id,
    },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '30d' }
  );

  return { access, refresh };
};

UserSchema.methods.addToken = function addToken(token: Token): Token {
  const user: IUser = this;
  user.authTokens.push(token);

  return token;
};

UserSchema.methods.updateToken = function updateToken(type: 'reset' | 'access' | 'pair', token?: string): string | Token {
  const user: IUser = this;
  switch (type) {
    case 'access':
      const authToken: Token = user.authTokens.find(({ refresh }) => refresh === token)!;
      const newAccess = user.generateJWT('access') as string;
      authToken.access = newAccess;
      return newAccess;
    case 'reset':
      const changePassword = user.generateJWT('reset') as string;
      user.changePasswordToken = changePassword;
      return changePassword;
    case 'pair':
    default:
      const newToken = user.generateJWT(type) as Token;
      user.authTokens = user.authTokens.filter(({ refresh }) => token !== refresh);
      user.authTokens.push(newToken);
      return newToken as Token;
  }
};

UserSchema.methods.generateChangePasswordToken = function generateResetPasswordToken(): string {
  const user: IUser = this;
  const changePasswordToken: string = user.generateJWT('reset') as string;
  return (user.changePasswordToken = changePasswordToken);
};

UserSchema.methods.updateCredentials = function updateCredentials(credentials: Credentials) {
  const user = this;

  Object.assign(user, credentials);
};

UserSchema.methods.deleteChangePasswordToken = function deleteChangePasswordToken() {
  const user: IUser = this;
  user.changePasswordToken = null;
};

UserSchema.methods.logout = function logout(refresh: string) {
  const user: IUser = this;
  user.authTokens = user.authTokens.filter(token => token.refresh !== refresh);
};

const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;
