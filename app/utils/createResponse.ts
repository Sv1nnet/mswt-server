import { ResponseError } from "./createResponseError";

// TODO replace with class
export const createResponse = <D = null>(data: D, error: ResponseError | null = null) => ({
  data,
  error,
  success: !error,
})

export type AppResponse = ReturnType<typeof createResponse>
