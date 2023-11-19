import { Request, Response } from 'express';
import _ from 'lodash';
import User from 'models/User';
import Exercise from 'models/Exercise';
import { createRequestError, createResponseError } from 'utils/createResponseError';
import { createResponse } from '@/app/utils/createResponse';
import getUserOrThrow from '@/app/utils/getUserOrThrow';
import { IExercise } from '@/app/models/Exercise/types';
import { Types } from 'mongoose';

type User = {
  id: string;
  access: string;
};

interface RequestWithUser extends Request {
  user: User;
  form: any
}

type Form = {
  image_uid?: string
}

// use after withAccess
const copyExercise = async (req: RequestWithUser, res: Response) => {
  const { id } = req.user;
  const { ids } = req.body;

  try {
    let user = await getUserOrThrow(id)
    if (!ids.every(exercise_id => user.exercises.includes(exercise_id))) {
      throw createRequestError(
        "An exercise to copy not found",
        createResponseError('exerciseToCopyNotFound', 404),
      )
    }

    let exercises: IExercise[] = await Exercise.find({ _id: { $in: ids } });
    if (!exercises.length) {
      throw createRequestError(
        "No exercises to copy",
        createResponseError('exerciseToCopyNotFound', 404),
      )
    }

    await Promise.all(exercises.map(async (exercise) => {
      const exr = exercise.toObject()
      let newExercise = await new Exercise({
        ...exr,
        title: `${exr.title} ${user.settings.lang === "ru" ? "(копия)" : "(copy)"}`,
        is_in_workout: false,
        in_workouts: [],
      })
      newExercise._id = Types.ObjectId()
      newExercise = await newExercise.save()
      
      user.addExercise(newExercise)
      return newExercise
    }))

    user = await user.save()

    res.statusCode = 200;
    res.json(createResponse())
  } catch (error) {
    console.log('create exercise', error);
    if (error?.name === 'ValidationError') {
      error = createRequestError('Invalid form data', createResponseError('invalidFormData', 400))
    }

    res.statusCode = error.code;
    res.json(createResponse(null, { ...error, message: error?.message || 'Something went wrong' }));
  }
};

export default copyExercise;
