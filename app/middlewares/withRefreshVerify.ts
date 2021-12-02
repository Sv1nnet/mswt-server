import { Request, RequestHandler, Response, NextFunction } from 'express';
import { IncomingHttpHeaders } from 'http';
import jwt, { Secret } from 'jsonwebtoken';
import { Decoded, Token, Refresh } from 'models/User/types';

export type User = {
  id: string;
  refresh: string;
};
export interface Headers extends IncomingHttpHeaders {
  authorization: string;
}
export interface IReqWithRefreshToken extends Request {
  user: User;
  headers: Headers;
}

const withRefreshVerify = async (req: IReqWithRefreshToken, res: Response, next: NextFunction) => {
  let refresh = '';
  const { refresh_token } = req.cookies

  if (refresh_token) {
    refresh = refresh_token;
  } else if (req.headers.authorization && req.headers.authorization.includes('Bearer ')){
    [, refresh = ''] = req.headers.authorization.split(' ') as [string, Refresh];
  }

  const secret = process.env.JWT_REFRESH_SECRET as Secret;

  jwt.verify(refresh, secret, (err, decoded: Decoded) => {
    if (!err) {
      req.user = {
        refresh,
        id: decoded._id,
      };
      return next();
    }

    console.log(err.message);
    res.statusCode = 403;
    res.json({ message: err.message || 'Token is invalid' });
  });
};

export default withRefreshVerify;
