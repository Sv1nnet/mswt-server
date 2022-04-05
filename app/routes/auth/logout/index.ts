import { Request, Response } from 'express';
import User from '../../../models/User';
import { IUser } from 'models/User/types';

type User = {
  id: string;
  refresh: string;
};

interface LogoutRequest extends Request {
  user: User;
}

// use after withRefresh
const logout = async (req: LogoutRequest, res: Response) => {
  const { user: userInReq } = req;
  try {
    let user: IUser = await User.findOne({ _id: userInReq.id });
    user.logout(userInReq.refresh);
    user = await user.save();

    res.statusCode = 200;
    res.cookie('refresh_token', '', { secure: false, httpOnly: true, expires: new Date() })
    res.cookie('access_token', '', { secure: false, httpOnly: true, expires: new Date() })
    res.json({ message: 'success' });
  } catch (error) {
    console.log(error);
    res.statusCode = 500;
    res.json({ message: error.message });
  }
};

export default logout;
