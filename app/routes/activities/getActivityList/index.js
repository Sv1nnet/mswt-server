import Activity from 'models/Activity';
import Workout from 'models/Workout';
import Exercise from 'models/Exercise';
import User from 'models/User';
import { Types } from 'mongoose';
import { createRequestError, createResponseError } from 'utils/createResponseError';
import { createResponse } from '@/app/utils/createResponse';
import { pickActivityList } from '@/app/utils/pickObjectFromMDBDoc';

// use after withAccess
const getActivityList = async (req, res) => {
  const { id } = req.user;
  const { page = 1, byPage = 30 } = req.params

  try {
    const user = await User.findOne({ _id: id });
    if (!user) {
      throw createRequestError(
        "Uesr not found",
        createResponseError('userNotFound', 404),
      )
    }

    const startIndex = (page - 1) * byPage
    const endIndex = startIndex + (byPage + 1)

    let activities = await Activity.find({ '_id': { $in: user.activities.slice(startIndex, endIndex) } }).limit(31)
    const workoutsInActivities = await Workout.find({ '_id': { $in: activities.map(activity => Types.ObjectId(activity.workout_id)) }})
    activities = activities.sort((a, b) => b._doc.index - a._doc.index).map(activity => ({ ...activity._doc, workout_title: workoutsInActivities.find(workout => workout._id.toString() === activity.workout_id).title }))

    const exercisesInActivity = (await Exercise.find({
      '_id': {
        $in: workoutsInActivities.reduce((acc, workout) => acc.concat(workout.exercises.map(({ id }) => id)), [])
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
    res.json(createResponse(pickActivityList(activities)));
  } catch (error) {
    console.log(error);
    res.statusCode = error.code;
    res.json(createResponse(null, { ...error, message: error.message || 'Something went wrong' }));
  }
};

export default getActivityList;