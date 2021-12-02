import { ResponseError } from "./createResponseError";

export const createResponse = <D = null>(data: D, error: ResponseError | null = null) => ({
  data,
  error,
  success: !error,
})

export type AppResponse = ReturnType<typeof createResponse>
