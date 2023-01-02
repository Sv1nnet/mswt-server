import { createResponse } from '@/app/utils/createResponse';
import { createRequestError, createResponseError } from '@/app/utils/createResponseError';
import { Request, Response } from 'express';
import _ from 'lodash';
import User from 'models/User';
import { IUser } from 'models/User/types';
import { pickConfig } from 'utils/pickObjectFromMDBDoc';

type User = {
  id: string;
  access: string;
};

interface ProjectListRequest extends Request {
  user: User;
}

// use after withAccess
const getProfile = async (req: ProjectListRequest, res: Response) => {
  const { id } = req.user;

  try {
    const user: IUser = await User.findOne({ _id: id });
    if (!user) {
      throw createRequestError(
        "Uesr not found",
        createResponseError('userNotFound', 404),
      ) 
    }
    res.statusCode = 200;
    res.json(createResponse(pickConfig(user).settings));
  } catch (error) {
    console.log(error);
    res.statusCode = error.code;
    res.json(createResponse(null, { ...error, message: error.message || 'Something went wrong' }));
  }
};

export default getProfile;
