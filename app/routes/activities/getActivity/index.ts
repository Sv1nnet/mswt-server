import { Request, Response } from 'express';
import _ from 'lodash';
import Activity from 'models/Activity';
import { IActivity } from 'models/Activity/types';
import User from 'models/User';
import { IUser } from 'models/User/types';
import { Document } from 'mongoose';
import { createRequestError, createResponseError } from 'utils/createResponseError';
import { createResponse } from '@/app/utils/createResponse';
import { pickActivity } from '@/app/utils/pickObjectFromMDBDoc';

type User = {
  id: string;
  access: string;
};

interface IRequestWithUser extends Request {
  user: User;
}

// use after withAccess
const getActivity = async (req: IRequestWithUser, res: Response) => {
  const { id } = req.user;
  const { id: activity_id } = req.params

  try {
    const user: IUser = await User.findOne({ _id: id });

    if (!user) {
      throw createRequestError(
        "Uesr not found",
        createResponseError('userNotFound', 404),
      )
    }

    if (!user.activities.includes(activity_id as unknown as Pick<Document, '_id'>)) {
      throw createRequestError(
        "The activity doesn't exist",
        createResponseError('activityNotFound', 404),
      )
    }

    const activity: IActivity = await Activity.findOne({ _id: activity_id });
    if (!activity) {
      throw createRequestError(
        "The activity doesn't exist",
        createResponseError('workoutNotFound', 404),
      )
    }

    console.log('activity results', pickActivity(activity).results)
    res.statusCode = 200;
    res.json(createResponse(pickActivity(activity)));
  } catch (error) {
    console.log(error);
    res.statusCode = error.code;
    res.json(createResponse(null, { ...error, message: error.message || 'Something went wrong' }));
  }
};

export default getActivity;
