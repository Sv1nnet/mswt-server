import { Request, Response } from 'express';
import _ from 'lodash';
import Exercise from 'models/Exercise';
import { IExercise } from 'models/Exercise/types';
import User from 'models/User';
import { IUser } from 'models/User/types';
import { Document } from 'mongoose';
import { createRequestError, createResponseError } from 'utils/createResponseError';
import { createResponse } from '@/app/utils/createResponse';
import { pickExerciseList } from '@/app/utils/pickObjectFromMDBDoc';

type User = {
  id: string;
  access: string;
};

interface IRequestWithUser extends Request {
  user: User;
}

// use after withAccess
const getExerciseList = async (req: IRequestWithUser, res: Response) => {
  const { id } = req.user;

  try {
    const user: IUser = await User.findOne({ _id: id });
    const exercises = await Exercise.find({ '_id': { $in: user.exercises } })
    // if (!user) {
    //   throw createRequestError(
    //     "The exercise doesn't exist",
    //     createResponseError('exerciseNotFound', 404),
    //   )
    // }

    // const exercise: IExercise = await Exercise.findOne({ _id: exercise_id });
    // if (!exercise) {
    //   throw createRequestError(
    //     "The exercise doesn't exist",
    //     createResponseError('exerciseNotFound', 404),
    //   )
    // }

    res.statusCode = 200;
    res.json(createResponse(pickExerciseList(exercises)));
  } catch (error) {
    console.log(error);
    res.statusCode = error.code;
    res.json(createResponse(null, { ...error, message: error.message || 'Something went wrong' }));
  }
};

export default getExerciseList;
