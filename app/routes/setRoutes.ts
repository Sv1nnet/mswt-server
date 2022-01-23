import { Router } from 'express';
import withAccessVerify from '../middlewares/withAccessVerify';
import withRefreshVerify from '../middlewares/withRefreshVerify';
import * as auth from './auth';
import * as user from './user';
import * as profile from './profile';

export default function setRoutes() {
  const router = Router();

  // auth
  router.post('/v1/auth/login', auth.login);
  router.post('/v1/auth/signup', auth.signup);

  router.post('/v1/auth/logout', withRefreshVerify, auth.logout);
  router.get('/v1/auth/token/refresh', withRefreshVerify, auth.refresh);
  router.post('/v1/auth/token/access', withRefreshVerify, auth.access);

  // user
  router.get('/v1/user', withAccessVerify, user.getUser);
  router.get('/v1/profile', withAccessVerify, profile.getProfile);
  router.patch('/v1/profile/update', withAccessVerify, profile.updateProfile);

  return router;
}
