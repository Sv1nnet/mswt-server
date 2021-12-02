import { Errors, ResponseErrorProp, errors } from 'app/constants/codes'

export const createRequestError = (message: string, errorObj: ResponseError) => Object.assign(new Error(message), errorObj)

export const createResponseError = (type: keyof Errors, code: number, lang: 'ru' | 'eng' = 'eng') => ({
  code,
  appCode: errors[type].code,
  message: errors[type].message[lang] || errors[type].message.eng,
})

export type ResponseError = ReturnType<typeof createResponseError>
export type RequestError = ReturnType<typeof createRequestError>
