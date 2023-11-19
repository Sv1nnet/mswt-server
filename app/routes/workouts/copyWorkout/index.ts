import { Request, Response } from 'express';
import _ from 'lodash';
import User from 'models/User';
import Workout from 'models/Workout';
import { createRequestError, createResponseError } from 'utils/createResponseError';
import { createResponse } from '@/app/utils/createResponse';
import getUserOrThrow from '@/app/utils/getUserOrThrow';
import { IWorkout } from '@/app/models/Workout/types';
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
const copyWorkout = async (req: RequestWithUser, res: Response) => {
  const { id } = req.user;
  const { ids } = req.body;

  try {
    let user = await getUserOrThrow(id)
    if (!ids.every(workout_id => user.workouts.includes(workout_id))) {
      throw createRequestError(
        "An workout to copy not found",
        createResponseError('workoutToCopyNotFound', 404),
      )
    }

    let workouts: IWorkout[] = await Workout.find({ _id: { $in: ids } });
    if (!workouts.length) {
      throw createRequestError(
        "No workouts to copy",
        createResponseError('workoutToCopyNotFound', 404),
      )
    }

    await Promise.all(workouts.map(async (workout) => {
      const wrk: IWorkout = workout.toObject()
      let newWorkout = await new Workout({
        ...wrk,
        exercises: wrk.exercises.map(exercise => ({
          ...exercise,
          _id: Types.ObjectId(),
        })),
        title: `${wrk.title} ${user.settings.lang === "ru" ? "(копия)" : "(copy)"}`,
        is_in_activity: false,
        in_activities: [],
      })
      newWorkout._id = Types.ObjectId()
      newWorkout = await newWorkout.save()
      
      user.addWorkout(newWorkout)
      return newWorkout
    }))

    user = await user.save()

    res.statusCode = 200;
    res.json(createResponse())
  } catch (error) {
    console.log('create workout', error);
    if (error?.name === 'ValidationError') {
      error = createRequestError('Invalid form data', createResponseError('invalidFormData', 400))
    }

    res.statusCode = error.code;
    res.json(createResponse(null, { ...error, message: error?.message || 'Something went wrong' }));
  }
};

export default copyWorkout;
