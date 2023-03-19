import _ from 'lodash';
import User from 'models/User';
import { createResponse } from '@/app/utils/createResponse';
import { pickExercise, pickImage, pickWorkout } from '@/app/utils/pickObjectFromMDBDoc';
import Workout from '@/app/models/Workout';
import Exercise from '@/app/models/Exercise';
import getUserOrThrow from '@/app/utils/getUserOrThrow';

// use after withAccess
const getWorkoutList = async (req, res) => {
  const { id } = req.user;

  try {
    const user = await getUserOrThrow(id)

    const workouts = (await Workout.find({ '_id': { $in: user.workouts }, archived: { $ne: true } })).map((workout) => {
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

    // setTimeout(() => {
    //   res.statusCode = 200;
    //   res.json(createResponse(preparedWorkouts));
    // }, 5000)
    res.statusCode = 200;
    res.json(
      createResponse(
        preparedWorkouts
          .reverse()
          .sort((a, b) => {
            if (a.title > b.title) return 1
            else if (a.title < b.title) return -1
            return 0
          })
      )
    );
  } catch (error) {
    console.log(error);
    res.statusCode = error.code ?? 500;
    res.json(createResponse(null, { ...error, message: error.message || 'Something went wrong' }));
  }
};

export default getWorkoutList;
