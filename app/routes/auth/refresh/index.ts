import { Request, Response } from 'express';
import _ from 'lodash';
import User from '../../../models/User';
import { IUser, Token } from 'models/User/types';
import { createResponse } from '@/app/utils/createResponse';

type User = {
  id: string;
  refresh: string;
};

interface RefreshRequest extends Request {
  user: User;
}

const DAYS_30 = 30 * 24 * 60 * 60 * 1000

// use after withRefresh
const refresh = async (req: RefreshRequest, res: Response) => {
  const { refresh, id } = req.user;
  try {
    let user: IUser = await User.findOne({ _id: id });
    if (!user) throw new Error("Can't find the user");

    const tokens = user.updateToken('pair', refresh) as Token;
    await user.save();

    res.statusCode = 200;
    res.cookie('refresh_token', tokens.refresh, { secure: false, httpOnly: true, expires: new Date(Date.now() + DAYS_30) })
    res.cookie('access_token', tokens.access, { secure: false, httpOnly: false, expires: new Date(Date.now() + DAYS_30) })
    res.json(createResponse({ token: tokens.access }));
  } catch (error) {
    console.log(error);
    res.statusCode = 500;
    res.json({ message: error.message || 'Something went wrong' });
  }
};

export default refresh;
