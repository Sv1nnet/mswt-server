/** @format */

import { signupCodes } from "../constants/signup_codes";
import SignupCode from "../models/SignupCode";
import dbConnect, { DBConnect } from "./db/dbConnect";
import { url } from "../constants/routes";

const dbConnection = dbConnect();
const PORT = +process.env.SERVER_PORT;

const runServer = async ({ app }) => {
  const { con, err } = await new Promise<DBConnect>((res) => {
    let tries = 1;
    let timeout;
    const connect = async () => {
      console.log("Trying to connect to DB. Try:", tries++);
      const { value } = await dbConnection.next();
      console.log("============= connected to DB =============");
      if (value?.con) {
        clearTimeout(timeout);
        SignupCode.find({})
          .exec()
          .then(async (res) => {
            if (!res.length) {
              console.error("No signup codes found in DB. Trying to add ones");
              try {
                await SignupCode.insertMany(signupCodes.map((code) => ({ code, used: false })));
                console.log("Signup codes have been added");
                return res;
              } catch (err) {
                err.customMessage = "Could not add signup codes";
                throw err;
              }
            }
          })
          .catch((err) => {
            console.error("Error occured while trying to initialized signup codes");
            console.error("Error message", err.message);
            console.error("Errorcustom message", err.customMessage);
          });
        res(value);
      } else {
        console.warn("could not connect to DB", value?.err);
        timeout = setTimeout(connect);
      }
    };
    timeout = setTimeout(connect);
  });

  if (con) {
    const args =
      process.env.NODE_ENV === "production"
        ? [
            PORT,
            "server",
            () => {
              console.log(`⚡️[server]: Server is running at ${url.base()}`);
            },
          ]
        : [
            PORT,
            () => {
              console.log(`⚡️[server]: Server is running at ${url.base()}`);
            },
          ];

    app.listen(...(args as Parameters<typeof app.listen>));
  }

  if (err) {
    console.warn("Server is not running since there is no connection with DB")
    console.error(err);
  }
};

export default runServer;
