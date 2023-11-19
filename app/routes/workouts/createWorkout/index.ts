import { Request, Response } from 'express';
import _ from 'lodash';
import User from 'models/User';
import Exercise from 'models/Exercise';
import { createRequestError, createResponseError } from 'utils/createResponseError';
import { createResponse } from '@/app/utils/createResponse';
import { pickWorkout } from '@/app/utils/pickObjectFromMDBDoc';
import { Types } from 'mongoose';
import Workout from '@/app/models/Workout';
import getUserOrThrow from '@/app/utils/getUserOrThrow';
import { IExercise } from '@/app/models/Exercise/types';

type User = {
  id: string;
  access: string;
};

interface RequestWithUser extends Request {
  user: User;
  form: any
}

// use after withAccess
const createWorkout = async (req: RequestWithUser, res: Response) => {
  const { id } = req.user;
  const { body } = req

  try {
    let user = await getUserOrThrow(id)

    const exercises: IExercise[] = await Exercise.find({
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

    const updatedExercises = await Promise.all(exercises.map(async (exercise: IExercise) => {
      exercise.updateExercise({
        is_in_workout: true,
        in_workouts: [ ...exercise.in_workouts, workout._id ]
      })
      return await exercise.save()
    }))

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

export default createWorkout;
