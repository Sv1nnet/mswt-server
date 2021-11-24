import { Request, Response } from 'express';
import _ from 'lodash';
import User from '../../../models/User';
import { IUser, Token } from 'models/User/types';

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
    let user: IUser = await User.findOne({ _id: id });
    if (!user) throw new Error("Can't find the user");

    const token = user.updateToken('access', refresh) as Token;
    await user.save();

    res.statusCode = 200;
    res.json(token);
  } catch (error) {
    console.log(error);
    res.statusCode = 500;
    res.json({ message: error.message || 'Something gone wrong' });
  }
};

export default access;
