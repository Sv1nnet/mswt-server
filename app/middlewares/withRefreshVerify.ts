import { Request, RequestHandler, Response, NextFunction, json } from 'express';
import { IncomingHttpHeaders } from 'http';
import jwt, { Secret } from 'jsonwebtoken';
import User from 'models/User';
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

const withRefreshVerify = (req: IReqWithRefreshToken, res: Response, next: NextFunction) => {
  let refresh = '';
  const { refresh_token } = req.cookies

  if (refresh_token) {
    refresh = refresh_token;
  } else if (req.headers.authorization && req.headers.authorization.includes('Bearer ')){
    [, refresh = ''] = req.headers.authorization.split(' ') as [string, Refresh];
  }

  const secret = process.env.JWT_REFRESH_SECRET as Secret;

  console.log('before refresh validation. Token:', refresh)
  jwt.verify(refresh, secret, async (err, decoded: Decoded) => {
    if (!err) {
      const user =  await User.findById(decoded._id)
      if (user.authTokens.find(token => token.refresh === refresh)) {
        req.user = {
          refresh,
          id: decoded._id,
        };
        return next();
      }
    }

    console.log('Error while token validation', err ? err.message : err);
    res.statusCode = 403;
    res.cookie('refresh_token', '', { secure: false, httpOnly: true, expires: new Date() })
    res.cookie('access_token', '', { secure: false, httpOnly: true, expires: new Date() })
    res.json({ message: err ? err.message : 'Token is invalid' });
  });
};

export default withRefreshVerify;
