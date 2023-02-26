import { RequestHandler, Request, Response, NextFunction } from 'express';
import { IncomingHttpHeaders } from 'http';
import jwt, { Secret } from 'jsonwebtoken';
import { Decoded, Token, Access } from 'models/User/types';

export type User = {
  id: string;
  access: string;
};
export interface Headers extends IncomingHttpHeaders {
  authorization: string;
}
export interface IReqWithAccessToken extends Request {
  user: User;
  headers: Headers;
}

const withAccessVerify = async (req: IReqWithAccessToken, res: Response, next: NextFunction) => {
  const [, access] = req.headers.authorization ? req.headers.authorization.split(' ') as [string, Access] : ['', null];
  const secret = process.env.JWT_ACCESS_SECRET as Secret;

  if (access) {
    jwt.verify(access, secret, (err, decoded: Decoded) => {
      if (!err) {
        req.user = {
          access,
          id: decoded._id,
        };
        return next();
      }
      console.warn(err.message);
      res.statusCode = 401;
      res.json({ message: err.message || 'Token is invalid' });
    });
  } else {
    res.statusCode = 401;
    res.json({ message: 'Access token is not provided' });
  }

};

export default withAccessVerify;
