import { Errors, ResponseErrorProp, errors } from 'app/constants/codes'

export const createRequestError = (message: string, errorObj: ResponseError) => Object.assign(new Error(message), errorObj)

export const createResponseError = (type: keyof Errors, code: number, lang: 'ru' | 'eng' = 'eng', validation?: object) => ({
  code,
  appCode: errors[type].code,
  message: {
    validation,
    text: errors[type].message,
  }
})

export type ResponseError = ReturnType<typeof createResponseError>
export type RequestError = ReturnType<typeof createRequestError>
