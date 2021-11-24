import { IUser } from '@/app/models/User/types';
import _ from 'lodash';

export const pickUser = (user: IUser) => _.pick(user, ['email', 'nickName', 'firstName', 'lastName']);
