import Activity from 'models/Activity';
import Workout from 'models/Workout';
import Exercise from 'models/Exercise';
import { createResponse } from '@/app/utils/createResponse';
import { pickActivityList } from '@/app/utils/pickObjectFromMDBDoc';
import getUserOrThrow from '@/app/utils/getUserOrThrow';

// use after withAccess
const getActivityList = async (req, res) => {
  const { id } = req.user;

  let { page = 1, byPage = 30, searchValue = '' } = req.query

  try {
    let user = await getUserOrThrow(id)

    page = +page
    byPage = +byPage
    searchValue = searchValue.toLowerCase()

    const startIndex = ((page - 1) * byPage)
    const endIndex = startIndex + (byPage)

    /*
      - найти все активности пользователя
      - найти все воркауты пользователя
      - отфильтровать воркауты по сёрчВэлю
      - найти все активности содержащие воркаут из массива воркаутов
    */

    let activities = (await Activity.find({
      '_id': {
        $in: user.activities
      }
    })).filter(activity => 'workout_id' in activity).sort((a, b) => b._doc.index - a._doc.index)
    // .limit(byPage + 1)

    let workouts = (await Workout.find({
      'title': {
        $regex: new RegExp(searchValue), $options: "i" ,
      },
      '_id': {
        $in: user.workouts,
      },
      'is_in_activity': true
    }))

    let workoutIds = workouts.map(workout => workout._id.toString())
    activities = activities.filter(activity => workoutIds.includes(activity.workout_id.toString()))


    let total = activities.length

    activities = activities.slice(startIndex, endIndex)

    activities = activities
      .sort((a, b) => b._doc.index - a._doc.index)
      .map(activity => ({
        ...activity._doc,
        workout_title: workouts.find(workout => workout._id.toString() === activity.workout_id.toString()).title
      }))

    const exercisesInActivity = (await Exercise.find({
      '_id': {
        $in: workouts.reduce((acc, workout) => acc.concat(workout.exercises.map(({ id }) => id)), [])
      }
    })).map(exercise => exercise._doc)

    activities = activities.map(({ results, ...activity }) => {
      activity.results = results.map(({ _doc }) => {
        const exercise = exercisesInActivity.find(exercise => exercise._id.toString() === _doc.original_id)
        return {
          ..._doc,
          exercise_title: exercise.title,
          type: exercise.type,
          details: {
            repeats: exercise.repeats,
            time: exercise.time,
            weight: exercise.weight,
            mass_unit: exercise.mass_unit,
          }
        }
      })
      return activity
    })

    res.statusCode = 200;
    res.json(createResponse({
      total,
      list: pickActivityList(activities),
    }));
  } catch (error) {
    console.log(error);
    res.statusCode = error.code;
    res.json(createResponse(null, { ...error, message: error.message || 'Something went wrong' }));
  }
};

export default getActivityList;
