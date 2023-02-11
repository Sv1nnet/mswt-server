/** @format */

import User from "../models/User";
import { IUser } from "../models/User/types";
import { createRequestError, createResponseError } from "./createResponseError";

const getUserOrThrow = async (id) => {
  const user: IUser = await User.findOne({ _id: id });
  if (!user) {
    throw createRequestError("User not found", createResponseError("userNotFound", 404));
  }
  return user
};

export default getUserOrThrow;
