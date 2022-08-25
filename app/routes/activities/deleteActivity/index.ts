import { Request, Response } from 'express';
import _ from 'lodash';
import Activity from 'models/Activity';
import { IActivity } from 'models/Activity/types';
import User from 'models/User';
import { IUser } from 'models/User/types';
import { createRequestError, createResponseError } from 'utils/createResponseError';
import { createResponse } from '@/app/utils/createResponse';
import { pickActivityList } from '@/app/utils/pickObjectFromMDBDoc';

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
    let user: IUser = await User.findOne({ _id: id });

    if (!user) {
      throw createRequestError(
        'User not found',
        createResponseError('userNotFound', 404),
      )
    }

    ids = [].concat(activity_id || ids)
    const newActivities = user.deleteActivities(ids)
    user = await user.save()

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

    res.statusCode = 200;
    res.json(createResponse(pickActivityList(result)));
  } catch (error) {
    console.log(error);
    res.statusCode = error.code;
    res.json(createResponse(null, { ...error, message: error.message || 'Something went wrong' }));
  }
};

export default deleteActivity;
