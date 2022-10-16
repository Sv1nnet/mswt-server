import { createRequestError, createResponseError } from 'utils/createResponseError';
import { Request, Response } from 'express';
import SignupCode from 'models/SignupCode';
import { ISignupCode } from 'models/SignupCode/types';
import User from 'models/User';
import { IUser } from 'models/User/types';
import { createResponse } from 'utils/createResponse';

const verifySignupCode = async (req: Request<ISignupCode>, res: Response) => {
  const { code } = req.body as ISignupCode;

  try {
    let signupCode: ISignupCode = (await SignupCode.findOne({ code }));

    if (signupCode) {
      const user: IUser = await User.findOne({ signup_code: signupCode.code })
      if (user) {
        throw createRequestError('Signup code already in use', createResponseError('signupCodeInUse', 401));
      }
      res.statusCode = 200;
      res.json(createResponse({ signup_code: signupCode.code}));
    } else {
      throw createRequestError('Invalid signup code', createResponseError('signupCodeNotFound', 404));
    }
  } catch (error) {
    console.error(error);
    res.statusCode = error.code;
    res.json(createResponse(null, { ...error, message: error.message || 'Something went wrong' }));
  }
};

export default verifySignupCode;
