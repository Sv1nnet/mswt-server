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
import getUserOrThrow from '@/app/utils/getUserOrThrow';

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
    let user = await getUserOrThrow(id)

    const exercises = await Exercise.find({ '_id': { $in: user.exercises }, archived: { $ne: true } })

    res.statusCode = 200;
    res.json(createResponse(pickExerciseList(exercises.reverse())));
  } catch (error) {
    console.log(error);
    res.statusCode = error.code;
    res.json(createResponse(null, { ...error, message: error.message || 'Something went wrong' }));
  }
};

export default getExerciseList;
