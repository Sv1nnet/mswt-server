import { Router } from 'express';
import withAccessVerify from '../middlewares/withAccessVerify';
import withRefreshVerify from '../middlewares/withRefreshVerify';
import getUploadedImage from './uploads';
import * as auth from './auth';
import * as user from './user';
import * as profile from './profile';
import * as exercise from './exercises';
import * as workout from './workouts';

export default function setRoutes() {
  const router = Router();

  router.get('/uploads/:userId/:exerciseId/:imageName', getUploadedImage)

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

  // exercise
  router.post('/v1/exercise/create', withAccessVerify, exercise.createExercise);
  router.patch('/v1/exercise/update/:id', withAccessVerify, exercise.updateExercise);
  router.get('/v1/exercise/list', withAccessVerify, exercise.getExerciseList);
  router.get('/v1/exercise/:id', withAccessVerify, exercise.getExercise);
  router.delete('/v1/exercise/delete', withAccessVerify, exercise.deleteExercise);
  router.delete('/v1/exercise/delete/:id', withAccessVerify, exercise.deleteExercise);
  
  // workout
  router.post('/v1/workout/create', withAccessVerify, workout.createWorkout)
  router.patch('/v1/workout/update/:id', withAccessVerify, workout.updateWorkout)
  router.get('/v1/workout/list', withAccessVerify, workout.getWorkoutList)
  router.get('/v1/workout/:id', withAccessVerify, workout.getWorkout)
  router.delete('/v1/workout/delete', withAccessVerify, workout.deleteWorkout)
  router.delete('/v1/workout/delete/:id', withAccessVerify, workout.deleteWorkout)

  return router;
}
