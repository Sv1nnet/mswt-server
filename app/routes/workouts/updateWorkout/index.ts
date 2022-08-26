import { Request, Response } from 'express';
import _ from 'lodash';
import formidable from 'formidable';
import Workout from 'models/Workout';
import Activity from 'models/Activity';
import { Workout as TypeWorkout, IWorkout } from '@/app/models/Workout/types';
import User from 'models/User';
import { IUser } from 'models/User/types';
import { Document } from 'mongoose';
import { createRequestError, createResponseError } from 'utils/createResponseError';
import { createResponse } from '@/app/utils/createResponse';
import { pickWorkout } from '@/app/utils/pickObjectFromMDBDoc';
import formatFormData from '@/app/utils/formatFormData';
import { nanoid } from 'nanoid';
import fs from 'fs'
import path from 'path'
import { IActivity } from '@/app/models/Activity/types';

type User = {
  id: string;
  access: string;
};

interface IRequestWithUser extends Request {
  user: User;
}

type Form = Partial<IWorkout> & {
  image_uid?: string
}

// use after withAccess
const updateWorkout = async (req: IRequestWithUser, res: Response) => {
  const { id } = req.user;
  const { id: workout_id } = req.params
  const { body } = req

  try {
    let user: IUser = await User.findOne({ _id: id });
    if (!user) {
      throw createRequestError(
        'User not found',
        createResponseError('userNotFound', 404),
      );
    }

    const activities: IActivity[] = await Activity.find({ '_id': { $in: user.activities }})

    if (activities.find((activity) => activity.workout_id === workout_id)) {
      throw createRequestError(
        'Workout can not be changed',
        createResponseError('unableToUpdateWorkout', 400),
      )
    }

    let workout: IWorkout = await Workout.findOne({ _id: workout_id })
    if (!workout) {
      throw createRequestError(
        'Workout not found',
        createResponseError('workoutNotFound', 404),
      );
    }

    workout.updateWorkout(body)

    workout = await workout.save()
    
    user = await user.save()

    res.statusCode = 200;
    res.json(createResponse(pickWorkout(workout)));
  } catch (error) {
    console.log(error);
    res.statusCode = error.code;
    res.json(createResponse(null, { ...error, message: error.message || 'Something went wrong' }));
  }
};

export default updateWorkout;
