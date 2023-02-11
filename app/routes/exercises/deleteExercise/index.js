import { Request, Response } from 'express';
import _ from 'lodash';
import Exercise from 'models/Exercise';
import { IExercise } from 'models/Exercise/types';
import User from 'models/User';
import { IUser } from 'models/User/types';
import { createRequestError, createResponseError } from 'utils/createResponseError';
import { createResponse } from '@/app/utils/createResponse';
import { pickExerciseList } from '@/app/utils/pickObjectFromMDBDoc';
import Workout from '@/app/models/Workout';
import getUserOrThrow from '@/app/utils/getUserOrThrow';

// type User = {
//   id: string;
//   access: string;
// };

// interface IRequestWithUser extends Request {
//   user: User;
// }

// use after withAccess
const deleteExercise = async (req, res) => {
  const { id } = req.user;
  const { id: exercise_id } = req.params
  let { ids } = req.body

  try {
    let user = await getUserOrThrow(id)

    ids = [].concat(exercise_id || ids)

    await Exercise.updateMany({ _id: { $in: ids } }, { $set: { archived: true } }, {multi: true })
    
    const exercises = await Exercise.find({ '_id': { $in: user.exercises }, archived: { $ne: true } })
    res.statusCode = 200;
    res.json(createResponse(pickExerciseList(exercises)));
  } catch (error) {
    console.log(error);
    res.statusCode = error.code;
    res.json(createResponse(null, { ...error, message: error.message || 'Something went wrong' }));
  }
};

export default deleteExercise;
