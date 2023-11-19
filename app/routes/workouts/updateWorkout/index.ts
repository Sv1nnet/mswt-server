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
import getUserOrThrow from '@/app/utils/getUserOrThrow';
import ExerciseModel from '@/app/models/Exercise';
import { IExercise } from '@/app/models/Exercise/types';

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
    let user = await getUserOrThrow(id)

    const activities: IActivity[] = await Activity.find({ '_id': { $in: user.activities }})

    let workout: IWorkout = await Workout.findOne({ _id: workout_id })
    if (!workout) {
      throw createRequestError(
        'Workout not found',
        createResponseError('workoutNotFound', 404),
      );
    }

    const exercisesInWorkout = [ ...workout.exercises ]

    if (activities.find((activity) => activity.workout_id === workout_id)) {
      workout.updateWorkout({
        ...body,
        exercises: body.exercises.map((exercise, index) => ({
          ...workout.exercises[index]["_doc"],
          round_break: exercise.round_break,
          break: exercise.break,
          break_enabled: exercise.break_enabled,
        }))
      })
    } else {
      workout.updateWorkout(body)
    }

    const updatedWorkout = await workout.save()

    const removedExercises = exercisesInWorkout.filter(exercise => !updatedWorkout.exercises.find(exr => exr.id === exercise.id)).map(exercise => exercise.id)
    if (removedExercises.length) {
      const exercisesToUpdate: IExercise[] = await ExerciseModel.find({ _id: { $in: removedExercises }})

      await Promise.all(exercisesToUpdate.map(async exercise => {
        exercise.removeFromWorkout(workout_id)
        await exercise.save()
      }))
    }
    
    user = await user.save()

    res.statusCode = 200;
    res.json(createResponse(pickWorkout(updatedWorkout)));
  } catch (error) {
    console.log(error);
    res.statusCode = error.code;
    res.json(createResponse(null, { ...error, message: error.message || 'Something went wrong' }));
  }
};

export default updateWorkout;
