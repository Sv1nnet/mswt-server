import { Request, Response } from 'express';
import _ from 'lodash';
import User from 'models/User';
import { IUser } from 'models/User/types';
import { pickUser } from 'utils/pickObjectFromMDBDoc';

type User = {
  id: string;
  access: string;
};

interface ProjectListRequest extends Request {
  user: User;
}

// use after withAccess
const getUser = async (req: ProjectListRequest, res: Response) => {
  const { id } = req.user;

  try {
    const user: IUser = await User.findOne({ _id: id });
    if (!user) throw new Error("The user doesn't exist");
    res.statusCode = 200;
    res.json(pickUser(user));
  } catch (error) {
    console.log(error);
    res.statusCode = 500;
    res.json({ message: error.message || 'Something gone wrong' });
  }
};

export default getUser;
