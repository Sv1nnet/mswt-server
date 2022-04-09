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
import Workout from '@/app/models/Workout';

type User = {
  id: string;
  access: string;
};

interface IRequestWithUser extends Request {
  user: User;
}

// use after withAccess
const deleteExercise = async (req: IRequestWithUser, res: Response) => {
  const { id } = req.user;
  const { id: exercise_id } = req.params
  let { ids } = req.body

  try {
    let user: IUser = await User.findOne({ _id: id });

    if (!user) {
      throw createRequestError(
        'User not found',
        createResponseError('userNotFound', 404),
      )
    }

    ids = [].concat(exercise_id || ids)
    const newExercises = user.deleteExercises(ids)
    user = await user.save()

    const workouts = await Workout.find({ '_id': { $in: user.workouts }})

    if (workouts.find((workout) => workout.exercises.find(exercise => ids.includes(exercise.id)))) {
      throw createRequestError(
        'Exercises can not be deleted',
        createResponseError('unableToDeleteExercise_inWorkout', 400),
      )
    }

    const result = await new Promise<IExercise[]>((resolve, reject) => {
      Exercise.deleteMany({ _id: { $in: ids } }, (err) => {
        if (!err) {
          Exercise.find({ _id: { $in: newExercises }}, (err, docs) => {
            if (!err) resolve(docs)
            else reject(err)
          })
        } else reject(err)
      })
    })

    res.statusCode = 200;
    res.json(createResponse(pickExerciseList(result)));
  } catch (error) {
    console.log(error);
    res.statusCode = error.code;
    res.json(createResponse(null, { ...error, message: error.message || 'Something went wrong' }));
  }
};

export default deleteExercise;
