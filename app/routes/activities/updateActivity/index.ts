import { Request, Response } from 'express';
import _ from 'lodash';
import formidable from 'formidable';
import Activity from 'models/Activity';
import { Activity as TypeActivity, IActivity } from '@/app/models/Activity/types';
import User from 'models/User';
import { IUser } from 'models/User/types';
import { Document } from 'mongoose';
import { createRequestError, createResponseError } from 'utils/createResponseError';
import { createResponse } from '@/app/utils/createResponse';
import { pickActivity } from '@/app/utils/pickObjectFromMDBDoc';
import formatFormData from '@/app/utils/formatFormData';
import { nanoid } from 'nanoid';
import fs from 'fs'
import path from 'path'
import getUserOrThrow from '@/app/utils/getUserOrThrow';

type User = {
  id: string;
  access: string;
};

interface IRequestWithUser extends Request {
  user: User;
}

type Form = Partial<IActivity> & {
  image_uid?: string
}

// use after withAccess
const updateActivity = async (req: IRequestWithUser, res: Response) => {
  const { id } = req.user;
  const { id: activity_id } = req.params
  const { body } = req

  try {
    let user = await getUserOrThrow(id)

    let activity: IActivity = await Activity.findOne({ _id: activity_id })
    if (!activity) {
      throw createRequestError(
        'Activity not found',
        createResponseError('activityNotFound', 404),
      );
    }

    activity.updateActivity(body)

    activity = await activity.save()
    
    user = await user.save()

    res.statusCode = 200;
    res.json(createResponse(pickActivity(activity)));
  } catch (error) {
    console.log(error);
    res.statusCode = error.code;
    res.json(createResponse(null, { ...error, message: error.message || 'Something went wrong' }));
  }
};

export default updateActivity;
