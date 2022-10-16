import { createRequestError, createResponseError } from 'utils/createResponseError';
import { Request, Response } from 'express';
import User from 'models/User';
import { Credentials, IUser, Token } from 'models/User/types';
import { createResponse } from 'utils/createResponse';

const DAYS_30 = 30 * 24 * 60 * 60 * 1000

const signup = async (req: Request<Credentials>, res: Response) => {
  const { password: userPassword, ...credentials } = req.body as Credentials;

  try {
    let user: IUser = await new User({ ...credentials });
    user.hashPassword(userPassword!);

    const tokens = user.generateJWT('pair') as Token;
    user.addToken(tokens);
    user = await user.save();

    res.statusCode = 200;
    res.cookie('refresh_token', tokens.refresh, { secure: false, httpOnly: true, expires: new Date(Date.now() + DAYS_30) })
    res.cookie('access_token', tokens.access, { secure: false, httpOnly: true, expires: new Date(Date.now() + DAYS_30) })
    res.json(createResponse({ token: tokens.access }));
  } catch (error) {
    console.warn(error);
    if (error._message === 'User validation failed') {
      const { email, password, signup_code } = error.errors
      if (email) {
        const { kind } = email
        if (kind === 'minlength') {
          const errorToSend = createRequestError(
            'Email is too short',
            createResponseError('invalidEmail', 403),
          )
          res.statusCode = errorToSend.code;
          res.json(
            createResponse(
              null,
              { ...errorToSend, message: errorToSend.message }
            )
          )
        } else if (kind === 'user defined') {
          const errorToSend = createRequestError(
            'User exists',
            createResponseError('userAlreadyExists', 403),
          )
          res.statusCode = errorToSend.code;
          res.json(
            createResponse(
              null,
              { ...errorToSend, message: errorToSend.message }
            )
          )
        }
      } else if (password) {
        const errorToSend = createRequestError(
          'Password invalid',
          createResponseError('shortPassword', 403),
        )
        res.statusCode = errorToSend.code;
        res.json(
          createResponse(
            null,
            { ...errorToSend, message: errorToSend.message },
          )
        )
      } else if (signup_code) {
        const errorToSend = createRequestError(
          'Invalid signup code',
          createResponseError('signupCodeNotFound', 404),
        )
        res.statusCode = errorToSend.code;
        res.json(
          createResponse(
            null,
            { ...errorToSend, message: errorToSend.message },
          )
        )
      }
      return
    }

    if (error.message.includes('duplicate key')) {
      const errorToSend = createRequestError(
        'User exists',
        createResponseError('userAlreadyExists', 403),
      )
      res.statusCode = errorToSend.code;
      res.json(
        createResponse(
          null,
          { ...errorToSend, message: errorToSend.message },
        )
      )
      return
    }

    const errorToSend = createRequestError(
      'Unknown error',
      createResponseError('unknownError', 500),
    )
    res.statusCode = errorToSend.code;
    res.json(
      createResponse(
        null,
        { ...errorToSend, message: errorToSend.message },
      )
    )
  }
};

export default signup;
