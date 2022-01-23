export const errors = {
  // Entity not found
  userNotFound: {
    code: 4041,
    message: {
      ru: 'Пользователь не найден',
      eng: 'User not found',
    }
  },
  exerciseNotFound: {
    code: 4042,
    message: {
      ru: 'Упражнение не найдено',
      eng: 'Exercise not found',
    }
  },
  trainingNotFound: {
    code: 4043,
    message: {
      ru: 'План тренировки не найден',
      eng: 'Training plan not found',
    }
  },
  workoutNotFound: {
    code: 4044,
    message: {
      ru: 'Тренировка не найдена',
      eng: 'Workout not found',
    }
  },

  // Auth errors
  tokenExpired: { // access token expired
    code: 4031,
    message: {
      ru: 'Время жизни токен доступа истекло',
      eng: 'Token expired',
    },
  },
  sessionExpired: { // refresh token invalid or expired
    code: 4032,
    message: {
      ru: 'Ваша сессия истекла. Пожалуйста, войдите заново.',
      eng: 'Your session expired. Please login again.',
    },
  },
  passwordWrong: {
    code: 4033,
    message: {
      ru: 'Неверный пароль',
      eng: 'Wrong password',
    },
  },
  userAlreadyExists: {
    code: 4034,
    message: {
      ru: 'Пользователь с указанным email уже существует',
      eng: 'A user with specified email already exists',
    }
  },
  invalidEmail: {
    code: 4035,
    message: {
      ru: 'Email слишком короткий. Минимальная длина 5 символов.',
      eng: 'Email is too short. 5 characters is minimum.',
    }
  },
  shortPassword: {
    code: 4036,
    message: {
      ru: 'Пароль слишком короткий.',
      eng: 'Password is too short.',
    }
  },

  // Server errors
  unknownError: {
    code: 5000,
    message: {
      ru: 'Ошибка сервера. Что-то пошло не так.',
      eng: 'Server error. Something has gone wrong.',
    },
  },
}

export type ResponseErrorProp = {
  code: number
  message: {
    ru: string
    eng: string
  }
}
export type Errors = typeof errors