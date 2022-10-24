import { Request, Response } from 'express';
import _ from 'lodash';
import User from 'models/User';
import { IUser } from 'models/User/types';
import { pickProfile } from 'utils/pickObjectFromMDBDoc';
import { createRequestError, createResponseError } from 'utils/createResponseError';
import { createResponse } from '@/app/utils/createResponse';

type User = {
  id: string;
  access: string;
};

interface ProjectListRequest extends Request {
  user: User;
}

// use after withAccess
const updateProfile = async (req: ProjectListRequest, res: Response) => {
  const { id } = req.user;
  let { body: profile } = req

  try {
    let user: IUser = await User.findOne({ _id: id });
    if (!user) {
      throw createRequestError(
        'User not found',
        createResponseError('userNotFound', 404),
      );
    }

    if (!user.isValidPassword(profile.password)) {
      throw createRequestError(
        'Wrong password',
        createResponseError('passwordWrong', 403, undefined, { password: 'Wrong password' }),
      )
    }
    profile = { ...profile }
    if (profile.new_password) {
      profile.password = user.hashPassword(profile.new_password)
      delete profile.new_password
    } else {
      delete profile.password
    }

    try {
      user.updateCredentials(profile)
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
    res.json(createResponse(pickProfile(user)));
  } catch (error) {
    console.log('%c updating profile error ' + error.message, "color: yellow'");
    res.statusCode = error.code;
    res.json(createResponse(null, { ...error, message: error.message || 'Something went wrong' }));
  }
};

export default updateProfile;
