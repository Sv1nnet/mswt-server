import { Request, Response } from 'express';
import _ from 'lodash';
import Activity from 'models/Activity';
import { IActivity } from 'models/Activity/types';
import User from 'models/User';
import { IUser } from 'models/User/types';
import { createRequestError, createResponseError } from 'utils/createResponseError';
import { createResponse } from '@/app/utils/createResponse';
import { pickActivityList } from '@/app/utils/pickObjectFromMDBDoc';
import getUserOrThrow from '@/app/utils/getUserOrThrow';
import Workout from '@/app/models/Workout';
import { IWorkout } from '@/app/models/Workout/types';

type User = {
  id: string;
  access: string;
};

interface IRequestWithUser extends Request {
  user: User;
}

// use after withAccess
const deleteActivity = async (req: IRequestWithUser, res: Response) => {
  const { id } = req.user;
  const { id: activity_id } = req.params
  let { ids } = req.body

  try {
    let user = await getUserOrThrow(id)

    ids = [].concat(activity_id || ids)
    const newActivities = user.deleteActivities(ids)

    const activitiesToDelete: IActivity[] = await Activity.find({ _id: { $in: ids }})

    const result = await new Promise<IActivity[]>((resolve, reject) => {
      Activity.deleteMany({ _id: { $in: ids } }, (err) => {
        if (!err) {
          Activity.find({ _id: { $in: newActivities }}, (err, docs) => {
            if (!err) resolve(docs)
            else reject(err)
          })
        } else reject(err)
      })
    })

    user = await user.save()

    for (const activity of activitiesToDelete) {
      const activityId = activity._id
      const workoutId = activity.workout_id
      const workout: IWorkout = await Workout.findOne({ _id: workoutId })
      workout.removeFromActivity(activityId)
      await workout.save()
    }

    res.statusCode = 200;
    res.json(createResponse({
      total: result.length,
      list: pickActivityList(result)
    }));
  } catch (error) {
    console.log(error);
    res.statusCode = error.code;
    res.json(createResponse(null, { ...error, message: error.message || 'Something went wrong' }));
  }
};

export default deleteActivity;
