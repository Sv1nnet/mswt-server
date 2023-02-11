import { createRequestError, createResponseError } from "./createResponseError"

const waitFor = (ms, shouldThrow) => new Promise((res, rej) => {
  setTimeout(shouldThrow ? () => rej(createRequestError(
    'User not found',
    createResponseError('userNotFound', 404),
  )) : res, ms)
})

export default waitFor