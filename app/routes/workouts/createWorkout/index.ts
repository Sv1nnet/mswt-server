import { Request, Response } from 'express';
import _ from 'lodash';
import User from 'models/User';
import Exercise from 'models/Exercise';
import { createRequestError, createResponseError } from 'utils/createResponseError';
import { createResponse } from '@/app/utils/createResponse';
import { pickWorkout } from '@/app/utils/pickObjectFromMDBDoc';
import { Types } from 'mongoose';
import Workout from '@/app/models/Workout';

type User = {
  id: string;
  access: string;
};

interface RequestWithUser extends Request {
  user: User;
  form: any
}

// use after withAccess
const createExercise = async (req: RequestWithUser, res: Response) => {
  const { id } = req.user;
  const { body } = req
console.log('body', body)

  try {
    let user = await User.findOne({ _id: id })
    if (!user) {
      throw createRequestError(
        'User not found',
        createResponseError('userNotFound', 404),
      )
    }

    const exercises = await Exercise.find({
      _id: {
        $in: body.exercises.map(exercise => Types.ObjectId(exercise.id)),
      }
    })

    if (body.exercises.some(exercise => !exercises.find(_exercise => _exercise.id === exercise.id))) {
      throw createRequestError(
        'One or more exercises not found',
        createResponseError('exerciseNotFound', 404),
      )
    }

    const workout = await new Workout({ ...body }).save()

    user.addWorkout(workout)
    user = await user.save()

    res.statusCode = 200;
    res.json(createResponse(pickWorkout(workout)));
  } catch (error) {
    console.log('create workout', error);
    if (error?.name === 'ValidationError') {
      error = createRequestError('Invalid form data', createResponseError('invalidFormData', 400))
    }

    res.statusCode = error.code ?? 500;
    res.json(createResponse(null, { ...error, message: error?.message || 'Something went wrong' }));
  }
};

export default createExercise;
