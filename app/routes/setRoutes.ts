import { Router } from 'express';
import withAccessVerify from '../middlewares/withAccessVerify';
import withRefreshVerify from '../middlewares/withRefreshVerify';
import * as auth from './auth';
import * as user from './user';

export default function setRoutes() {
  const router = Router();

  // auth
  router.post('/auth/login', auth.login);
  router.post('/auth/signup', auth.signup);

  router.post('/auth/logout', withRefreshVerify, auth.logout);
  router.get('/auth/refresh', withRefreshVerify, auth.refresh);
  router.get('/auth/access', withRefreshVerify, auth.access);

  // user
  router.get('/user', withAccessVerify, user.getUser);

  return router;
}
