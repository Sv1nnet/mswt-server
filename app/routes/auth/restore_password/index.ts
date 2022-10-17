import { createRequestError, createResponseError } from 'utils/createResponseError';
import { Request, Response } from 'express';
import SignupCode from 'models/SignupCode';
import { ISignupCode } from 'models/SignupCode/types';
import User from 'models/User';
import { IUser } from 'models/User/types';
import { createResponse } from 'utils/createResponse';

type User = {
  id: string;
  access: string;
};

const restorePassword = async (req, res: Response) => {
  const { signup_code, password } = req.body;

  try {
    const user: IUser = await User.findOne({ signup_code: signup_code })

    if (!user) {
      throw createRequestError('User with provided code is not found', createResponseError('signupCodeNotFound', 404));
    }

    const newPassword = user.hashPassword(password)
    user.updateCredentials({ password: newPassword })

    res.statusCode = 200;
    res.json(createResponse());
  } catch (error) {
    console.error(error);
    res.statusCode = error.code;
    res.json(createResponse(null, { ...error, message: error.message || 'Something went wrong' }));
  }
};

export default restorePassword;
