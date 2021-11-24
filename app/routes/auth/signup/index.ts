import { Request, Response } from 'express';
import _ from 'lodash';
import User from '../../../models/User';
import { Credentials, IUser, Token } from 'models/User/types';

const fields = ['email', 'nickName'];

const signup = async (req: Request<Credentials>, res: Response) => {
  const { password: userPassword, ...credentials } = req.body as Credentials;
  try {
    let user: IUser = await new User({ ...credentials });
    user.hashPassword(userPassword!);

    const tokens = user.generateJWT('pair') as Token;
    user.addToken(tokens);
    user = await user.save();

    res.statusCode = 200;
    res.json(tokens);
  } catch (error) {
    console.error(error);
    const rawField: string = error.message.includes('duplicate key') && error.message.split('key: ')[1];
    const field = fields.reduce((acc, f) => (rawField.includes(f) ? f : acc), '');

    res.statusCode = 500;
    res.json({ message: `User with such ${field} exists` });
  }
};

export default signup;
