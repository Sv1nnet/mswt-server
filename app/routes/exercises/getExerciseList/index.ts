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
  const { query } = req
  const { workoutId, lang } = query

  let archived = false
  if (query.archived === "true") {
    archived = true
  }

  try {
    let user = await getUserOrThrow(id)

    let exercises: IExercise[] = archived
      ? await Exercise.find({ '_id': { $in: user.exercises } })
      : await Exercise.find({ '_id': { $in: user.exercises }, archived: { $ne: true } })

    if (archived && workoutId) exercises = exercises.filter((exercise) => {
      if (exercise.archived) {
        return  exercise.is_in_workout && exercise.in_workouts.includes(workoutId)
      }
      return true
    })

    res.statusCode = 200;
    res.json(createResponse(
      (
        archived 
        ? pickExerciseList(exercises.reverse()).map((exercise) => {
          if (exercise.archived) {
            exercise.title = `${exercise.title} (${lang === 'ru' ? 'удалено' : 'deleted'})`
          }
          return exercise
        })
        : pickExerciseList(exercises.reverse())
      ).sort((a, b) => {
        if (a.title > b.title) return 1
        else if (a.title < b.title) return -1
        return 0
      })
    ));
  } catch (error) {
    console.log(error);
    res.statusCode = error.code;
    res.json(createResponse(null, { ...error, message: error.message || 'Something went wrong' }));
  }
};

export default getExerciseList;
