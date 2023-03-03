import { Request, Response } from 'express';
import _ from 'lodash';
import User from 'models/User';
import { IUser } from 'models/User/types';
import Activity from 'models/Activity';
import Workout from 'models/Workout';
import Exercise from 'models/Exercise';
import { createRequestError, createResponseError } from 'utils/createResponseError';
import { createResponse } from '@/app/utils/createResponse';
import { pickActivity } from '@/app/utils/pickObjectFromMDBDoc';
import formidable from 'formidable';
import fs from 'fs'
import path from 'path'
import formatFormData from '@/app/utils/formatFormData';
import { nanoid } from 'nanoid'
import { Types } from 'mongoose';
import getUserOrThrow from '@/app/utils/getUserOrThrow';
import { IWorkout } from '@/app/models/Workout/types';

type User = {
  id: string;
  access: string;
};

interface RequestWithUser extends Request {
  user: User;
  form: any
}

// use after withAccess
const createActivity = async (req: RequestWithUser, res: Response) => {
  const { id } = req.user;
  const { body } = req

  try {
    let user = await getUserOrThrow(id)

    const workout = await Workout.findById(body.workout_id)

    if (!workout) {
      throw createRequestError(
        'Workout in activity not found',
        createResponseError('workoutNotFound', 404),
      )
    }

    if (workout.exercises.some(exercise => !body.results.find(({ id_in_workout }) => id_in_workout === exercise._id.toString()))) {
      throw createRequestError(
        'One or more exercises not found',
        createResponseError('exerciseNotFound', 404),
      )
    }

    const exercisesInWorkout = await Exercise.find({
      _id: {
        $in: body.results.map(({ original_id }) => Types.ObjectId(original_id)),
      }
    })

    if (body.results.some(({ original_id }) => !exercisesInWorkout.find(_exercise => _exercise._id.toString() === original_id))) {
      throw createRequestError(
        'One or more exercises not found',
        createResponseError('exerciseNotFound', 404),
      )
    }

    const activity = await new Activity({
      ...body,
      index: new Date(body.date).valueOf(),
    }).save()

    workout.addActivity(activity._id)
    await workout.save()

    user.addActivity(activity)
    const activities = await Activity.find({ '_id': { $in: user.activities } })
    user.updateActivitiesOrderByIndex(activities)
    user = await user.save()

    res.statusCode = 200;
    res.json(createResponse(pickActivity(activity)));
  } catch (error) {
    console.log('create workout', error.message);
    if (error?.name === 'ValidationError') {
      error = createRequestError('Invalid form data', createResponseError('invalidFormData', 400))
    }

    res.statusCode = error.code ?? 500;
    res.json(createResponse(null, { ...error, message: error?.message || 'Something went wrong' }));
  }
};

export default createActivity;
