import { Request, Response } from 'express';
import _ from 'lodash';
import Exercise from 'models/Exercise';
import { IExercise } from 'models/Exercise/types';
import User from 'models/User';
import { IUser } from 'models/User/types';
import { Document } from 'mongoose';
import { createRequestError, createResponseError } from 'utils/createResponseError';
import { createResponse } from '@/app/utils/createResponse';
import { pickExercise } from '@/app/utils/pickObjectFromMDBDoc';

type User = {
  id: string;
  access: string;
};

interface IRequestWithUser extends Request {
  user: User;
}

// use after withAccess
const getExercise = async (req: IRequestWithUser, res: Response) => {
  const { id } = req.user;
  const { id: exercise_id } = req.params

  try {
    const user: IUser = await User.findOne({ _id: id });
    if (!user.exercises.includes(exercise_id as unknown as Pick<Document, '_id'>)) {
      throw createRequestError(
        "The exercise doesn't exist",
        createResponseError('exerciseNotFound', 404),
      )
    }

    const exercise: IExercise = await Exercise.findOne({ _id: exercise_id });
    if (!exercise) {
      throw createRequestError(
        "The exercise doesn't exist",
        createResponseError('exerciseNotFound', 404),
      )
    }

    res.statusCode = 200;
    res.json(createResponse(pickExercise(exercise)));
  } catch (error) {
    console.log(error);
    res.statusCode = error.code;
    res.json(createResponse(null, { ...error, message: error.message || 'Something went wrong' }));
  }
};

export default getExercise;
