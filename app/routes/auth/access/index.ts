import { Request, Response } from 'express';
import _ from 'lodash';
import User from '../../../models/User';
import { IUser, Token } from 'models/User/types';
import getUserOrThrow from '@/app/utils/getUserOrThrow';

type User = {
  id: string;
  refresh: string;
};

interface RefreshRequest extends Request {
  user: User;
}

// use after withRefresh
const access = async (req: RefreshRequest, res: Response) => {
  const { refresh, id } = req.user;
  try {
    let user = await getUserOrThrow(id)

    const token = user.updateToken('access', refresh) as Token;
    await user.save();

    res.statusCode = 200;
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.statusCode = 500;
    res.json({ message: error.message || 'Something went wrong' });
  }
};

export default access;
