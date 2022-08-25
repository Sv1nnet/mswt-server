import _ from 'lodash';
import User from 'models/User';
import { createResponse } from '@/app/utils/createResponse';
import { pickExercise, pickImage, pickWorkout } from '@/app/utils/pickObjectFromMDBDoc';
import Workout from '@/app/models/Workout';
import Exercise from '@/app/models/Exercise';

// use after withAccess
const getWorkoutList = async (req, res) => {
  const { id } = req.user;

  try {
    const user = await User.findOne({ _id: id });
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
    res.statusCode = error.code ?? 500;
    res.json(createResponse(null, { ...error, message: error.message || 'Something went wrong' }));
  }
};

export default getWorkoutList;
