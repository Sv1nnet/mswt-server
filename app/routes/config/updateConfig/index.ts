import { Request, Response } from 'express';
import _ from 'lodash';
import User from 'models/User';
import { IUser } from 'models/User/types';
import { pickConfig } from 'utils/pickObjectFromMDBDoc';
import { createRequestError, createResponseError } from 'utils/createResponseError';
import { createResponse } from '@/app/utils/createResponse';
import getUserOrThrow from '@/app/utils/getUserOrThrow';

type User = {
  id: string;
  access: string;
};

interface ProjectListRequest extends Request {
  user: User;
}

// use after withAccess
const updateConfig = async (req: ProjectListRequest, res: Response) => {
  const { id } = req.user;
  let { body: config } = req

  try {
    let user = await getUserOrThrow(id)

    try {
      user.updateCredentials({ settings: config })
    } catch {
      console.log('%c error while updating', "color: yellow'");
      throw createRequestError(
        'Update profile error',
        createResponseError('signupCodeNotFound', 403, undefined, { signup_code: 'Code not found' }),
      )
    }

    try {
      user = await user.save()
    } catch {
      console.log('%c error while saving', "color: yellow'");
      throw createRequestError(
        'Update profile error',
        createResponseError('signupCodeNotFound', 403, undefined, { signup_code: 'Code not found' }),
      )
    }

    res.statusCode = 200;
    res.json(createResponse(pickConfig(user).settings));
  } catch (error) {
    console.log('%c updating profile error ' + error.message, "color: yellow'");
    res.statusCode = error.code;
    res.json(createResponse(null, { ...error, message: error.message || 'Something went wrong' }));
  }
};

export default updateConfig;
