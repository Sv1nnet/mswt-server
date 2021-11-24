import { Request, Response } from 'express';
import User from '../../../models/User';
import { Credentials, IUser, Token } from 'models/User/types';

const login = async (req: Request<Credentials>, res: Response) => {
  const { password, email } = req.body;
  try {
    let user: IUser = await User.findOne({ email });
    if (!user) throw new Error("User with this email doesn't exist");
    if (!user.isValidPassword(password!)) throw new Error('Wrong password');

    const token = user.generateJWT('pair') as Token;
    user.addToken(token);
    user = await user.save();

    res.statusCode = 200;
    res.cookie('refresh_token', token.refresh, { httpOnly: true });
    res.json({ access: token.access });
  } catch (error) {
    console.log(error);
    res.statusCode = 500;
    res.json({ message: error.message || 'Something gone wrong' });
  }
};

export default login;
