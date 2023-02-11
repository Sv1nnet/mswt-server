import Activity from 'models/Activity';
import Workout from 'models/Workout';
import User from 'models/User';
import { createRequestError, createResponseError } from 'utils/createResponseError';
import { createResponse } from '@/app/utils/createResponse';
import getUserOrThrow from '@/app/utils/getUserOrThrow';

// use after withAccess
const getHistory = async (req, res) => {
  const { id } = req.user;
  const { workout_id } = req.params
  const { page = 1, byPage = 30, activity_id } = req.query
  let { offset } = req.query

  try {
    const user = await getUserOrThrow(id)

    let activities = (await Activity.find({ 'workout_id': { $in: workout_id } }))
    const total = activities.length
    activities = activities.sort((a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf())

    if (typeof offset !== 'number') offset = 0
    if (activity_id) offset = activities.findIndex(activity => activity._id.toString() === activity_id) + 1

    const startIndex = ((page - 1) * byPage) + offset
    const endIndex = startIndex + offset + (byPage + 2) // byPage (30 by default) + 2 to get byPage + 1 activities
    activities = activities.slice(startIndex, endIndex)

    const workout = await Workout.findOne({ '_id': workout_id })

    let results = activities.reduce((acc, activity) => {
      activity.results.forEach(exercise_results => {
        if (!acc[exercise_results.id_in_workout].total) {
          acc[exercise_results.id_in_workout].items = []
          acc[exercise_results.id_in_workout].total = total
        }
        acc[exercise_results.id_in_workout].items.push({
          date: activity.date,
          results: exercise_results.rounds,
        })
      })

      return acc
    }, workout.exercises.reduce((acc, exercise) => {
      acc[exercise._id] = { items: [], total: 0 }
      return acc
    }, {}))

    res.statusCode = 200;
    res.json(createResponse(results));
  } catch (error) {
    console.log(error);
    res.statusCode = error.code;
    res.json(createResponse(null, { ...error, message: error.message || 'Something went wrong' }));
  }
};

export default getHistory;
