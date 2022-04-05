import { Request, Response } from 'express';
import _ from 'lodash';
import Exercise from 'models/Exercise';
import { IExercise } from 'models/Exercise/types';
import User from 'models/User';
import { IUser } from 'models/User/types';
import { Document } from 'mongoose';
import { createRequestError, createResponseError } from 'utils/createResponseError';
import { createResponse } from '@/app/utils/createResponse';
import { pickExercise, pickWorkout } from '@/app/utils/pickObjectFromMDBDoc';
import Workout from '@/app/models/Workout';
import { IWorkout } from '@/app/models/Workout/types';

type User = {
  id: string;
  access: string;
};

interface IRequestWithUser extends Request {
  user: User;
}

// use after withAccess
const getWorkout = async (req: IRequestWithUser, res: Response) => {
  const { id } = req.user;
  const { id: workout_id } = req.params

  try {
    const user: IUser = await User.findOne({ _id: id });
    if (!user.workouts.includes(workout_id as unknown as Pick<Document, '_id'>)) {
      throw createRequestError(
        "The workout doesn't exist",
        createResponseError('workoutNotFound', 404),
      )
    }

    const workout: IWorkout = await Workout.findOne({ _id: workout_id });
    if (!workout) {
      throw createRequestError(
        "The workout doesn't exist",
        createResponseError('workoutNotFound', 404),
      )
    }

    res.statusCode = 200;
    res.json(createResponse(pickWorkout(workout)));
  } catch (error) {
    console.log(error);
    res.statusCode = error.code;
    res.json(createResponse(null, { ...error, message: error.message || 'Something went wrong' }));
  }
};

export default getWorkout;
