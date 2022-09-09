import { Request, Response } from 'express';
import _ from 'lodash';
import Exercise from 'models/Exercise';
import { IExercise } from 'models/Exercise/types';
import User from 'models/User';
import { IUser } from 'models/User/types';
import { Document } from 'mongoose';
import { createRequestError, createResponseError } from 'utils/createResponseError';
import { createResponse } from '@/app/utils/createResponse';
import { pickExercise, pickExerciseList, pickImage, pickWorkout, pickWorkoutList } from '@/app/utils/pickObjectFromMDBDoc';
import { IWorkout } from '@/app/models/Workout/types';
import Workout from '@/app/models/Workout';
import Activity from '@/app/models/Activity';

// use after withAccess
const deleteWorkout = async (req, res) => {
  const { id } = req.user;
  const { id: workout_id } = req.params
  let { ids } = req.body

  console.log('delete workout', workout_id, ids)

  try {
    let user = await User.findOne({ _id: id });

    if (!user) {
      throw createRequestError(
        'User not found',
        createResponseError('userNotFound', 404),
      )
    }

    if (workout_id && (await Workout.find({ _id: workout_id })).length === 0) {
      throw createRequestError(
        'Workout not found',
        createResponseError('workoutNotFound', 404),
      )
    }

    const activities = await Activity.find({ '_id': { $in: user.activities }})

    ids = [].concat(workout_id || ids)

    if (activities.find(activity => ids.includes(activity.workout_id))) {
      throw createRequestError(
        'Workout can not be delete',
        createResponseError('unableToDeleteWorkout', 400),
      )
    }

    const newWorkouts = user.deleteWorkouts(ids)
    user = await user.save()

    await new Promise((resolve, reject) => {
      Workout.deleteMany({ _id: { $in: ids } }, (err) => {
        if (!err) {
          Workout.find({ _id: { $in: newWorkouts }}, (err, docs) => {
            if (!err) resolve(docs)
            else reject(err)
          })
        } else reject(err)
      })
    })

    const workouts = (await Workout.find({ '_id': { $in: user.workouts } })).map((workout) => {
      const _workout = pickWorkout(workout._doc)
      _workout.id = _workout.id.toString()
      return _workout
    });

    const preparedWorkouts = (
      await Promise
        .all([...workouts].map(async (workout) => {
          const exerciseIdArr = [...workout.exercises].map(_e => _e.id)
          const rawExercises = await Exercise.find({ _id: { $in: exerciseIdArr }})
          const sortedRawExercises = []

          exerciseIdArr.forEach((_id, i) => {
            const indexInRawExercises = rawExercises.findIndex((exercise) => exercise.id === _id)
            sortedRawExercises[i] = rawExercises[indexInRawExercises]
          })

          const pickedExercises = sortedRawExercises.map((exercise) => {
            const picked = pickExercise(exercise)
            return {
              ...picked,
              id: picked.id.toString(),
              image: pickImage(picked.image),
            }
          })
          return {
            ...workout,
            exercises: workout.exercises.map((exercise, i) => ({
              ...exercise._doc,
              exercise: pickedExercises[i],
            }))
          }
        }))
    )

    res.statusCode = 200;
    res.json(createResponse(preparedWorkouts));
  } catch (error) {
    console.log(error);
    res.statusCode = error.code || 500;
    res.json(createResponse(null, { ...error, message: error.message || 'Something went wrong' }));
  }
};

export default deleteWorkout;
