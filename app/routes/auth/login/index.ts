import { createResponse } from 'utils/createResponse';
import { Request, Response } from 'express';
import User from 'models/User';
import { Credentials, IUser, Token } from 'models/User/types';
import { createRequestError, createResponseError } from 'utils/createResponseError';

const DAYS_30 = 30 * 24 * 60 * 60 * 1000

const login = async (req: Request<Credentials>, res: Response) => {
  const { password, email, settings } = req.body;

  try {
    let user: IUser = await User.findOne({ email });
    if (!user) throw createRequestError('User not found', createResponseError('userNotFound', 404));
    if (!user.isValidPassword(password!)) throw createRequestError('Wrong password', createResponseError('passwordWrong', 403));

    const tokens = user.generateJWT('pair') as Token;
    user.updateCredentials({ settings })
    user.addToken(tokens);
    user = await user.save();

    res.statusCode = 200;
    res.cookie('refresh_token', tokens.refresh, { secure: false, httpOnly: true, expires: new Date(Date.now() + DAYS_30) })
    res.cookie('access_token', tokens.access, { secure: false, httpOnly: false, expires: new Date(Date.now() + DAYS_30) })
    res.json(createResponse({ token: tokens.access }));
  } catch (error) {
    console.error(error);
    res.statusCode = error.code;
    res.json(createResponse(null, { ...error, message: error.message || 'Something went wrong' }));
  }
};

export default login;
